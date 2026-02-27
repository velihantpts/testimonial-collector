import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function getPlanFromPriceId(priceId: string): "STARTER" | "PRO" | null {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "STARTER";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "PRO";
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Webhook signature verification failed:", message);
      return NextResponse.json(
        { error: `Webhook Error: ${message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error("No userId in checkout session metadata");
          break;
        }

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!subscriptionId) {
          console.error("No subscription ID in checkout session");
          break;
        }

        // Get the subscription to determine the plan
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );
        const priceId = subscription.items.data[0]?.price?.id;

        if (!priceId) {
          console.error("No price ID found in subscription");
          break;
        }

        const plan = getPlanFromPriceId(priceId);

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId:
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id ?? undefined,
            stripeSubscriptionId: subscriptionId,
            ...(plan ? { plan } : {}),
          },
        });

        console.log(
          `Checkout completed for user ${userId}, plan: ${plan ?? "unknown"}`
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (!customerId) {
          console.error("No customer ID in subscription update");
          break;
        }

        const priceId = subscription.items.data[0]?.price?.id;

        if (!priceId) {
          console.error("No price ID found in subscription update");
          break;
        }

        const plan = getPlanFromPriceId(priceId);

        // If subscription is active or trialing, update plan
        // If subscription is canceled/past_due, downgrade to free
        if (
          subscription.status === "active" ||
          subscription.status === "trialing"
        ) {
          if (plan) {
            await prisma.user.update({
              where: { stripeCustomerId: customerId },
              data: {
                plan,
                stripeSubscriptionId: subscription.id,
              },
            });
            console.log(
              `Subscription updated for customer ${customerId}, plan: ${plan}`
            );
          }
        } else if (
          subscription.status === "canceled" ||
          subscription.status === "unpaid"
        ) {
          await prisma.user.update({
            where: { stripeCustomerId: customerId },
            data: {
              plan: "FREE",
              stripeSubscriptionId: null,
            },
          });
          console.log(
            `Subscription canceled/unpaid for customer ${customerId}, downgraded to FREE`
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (!customerId) {
          console.error("No customer ID in subscription deletion");
          break;
        }

        await prisma.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            plan: "FREE",
            stripeSubscriptionId: null,
          },
        });

        console.log(
          `Subscription deleted for customer ${customerId}, set to FREE`
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        console.warn(
          `Payment failed for customer ${customerId ?? "unknown"}, invoice ${invoice.id}`
        );
        break;
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
