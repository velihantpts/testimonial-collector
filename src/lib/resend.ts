import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTestimonialRequestEmail({
  to,
  recipientName,
  companyName,
  collectUrl,
}: {
  to: string;
  recipientName?: string;
  companyName: string;
  collectUrl: string;
}) {
  const { data, error } = await resend.emails.send({
    from: `${companyName} <noreply@testimonialbox.com>`,
    to,
    subject: `${companyName} would love your feedback`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #111827; margin-bottom: 16px;">Hi ${recipientName || "there"},</h2>
        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 24px;">
          ${companyName} values your opinion and would love to hear about your experience.
        </p>
        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 32px;">
          It only takes 2 minutes:
        </p>
        <a href="${collectUrl}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 500;">
          Leave a Testimonial
        </a>
        <p style="color: #6b7280; line-height: 1.6; margin-top: 32px;">
          Your feedback helps us improve and helps others make informed decisions.
        </p>
        <p style="color: #6b7280; line-height: 1.6; margin-top: 24px;">
          Thank you!<br/>${companyName}
        </p>
      </div>
    `,
  });

  if (error) throw error;
  return data;
}

export async function sendReminderEmail({
  to,
  recipientName,
  companyName,
  collectUrl,
}: {
  to: string;
  recipientName?: string;
  companyName: string;
  collectUrl: string;
}) {
  const { data, error } = await resend.emails.send({
    from: `${companyName} <noreply@testimonialbox.com>`,
    to,
    subject: `Quick reminder: Share your experience with ${companyName}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #111827; margin-bottom: 16px;">Hi ${recipientName || "there"},</h2>
        <p style="color: #6b7280; line-height: 1.6; margin-bottom: 32px;">
          Just a friendly reminder — we'd still love to hear your feedback.
        </p>
        <a href="${collectUrl}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 500;">
          Share Your Experience
        </a>
        <p style="color: #6b7280; line-height: 1.6; margin-top: 32px;">
          Thank you!<br/>${companyName}
        </p>
      </div>
    `,
  });

  if (error) throw error;
  return data;
}
