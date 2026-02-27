"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does TestimonialBox work?",
    answer:
      "TestimonialBox makes it easy to collect testimonials from your customers. Create a project, share a unique collection link, and your customers can submit written or video testimonials through a simple form. You can then manage, approve, and showcase these testimonials using embeddable widgets on your website.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes! Our Free plan is completely free forever with no credit card required. It includes up to 10 testimonials, 1 project, and 1 widget. It's a great way to get started and see how TestimonialBox can help your business.",
  },
  {
    question: "Can I customize the testimonial widget?",
    answer:
      "Absolutely. You can customize the widget layout (grid, carousel, wall of love), colors, fonts, and more to match your brand. On the Starter plan and above, you can also add custom branding and remove the TestimonialBox watermark.",
  },
  {
    question: "Do I need coding skills?",
    answer:
      "Not at all. Collecting testimonials requires zero coding — just share a link. Embedding widgets on your site requires copying a single line of code, and we provide step-by-step instructions for popular website builders like WordPress, Shopify, Squarespace, and more.",
  },
  {
    question: "How do video testimonials work?",
    answer:
      "Video testimonials are available on the Pro plan. Your customers can record a video directly in their browser using the collection link — no special software needed. Videos are stored securely and can be displayed in your testimonial widgets alongside text testimonials.",
  },
  {
    question: "Can I import existing reviews?",
    answer:
      "Yes. On the Pro plan you can import existing reviews from Google. We also support CSV import so you can bring in testimonials from any source. This makes it easy to consolidate all your social proof in one place.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) via Stripe. All transactions are processed securely. We also support yearly billing with a discount.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time with no penalties or hidden fees. When you cancel, you'll retain access to your current plan features until the end of your billing period. Your data is always yours — you can export it at any time.",
  },
];

function FAQItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-medium text-gray-900">{question}</span>
        <ChevronDown
          className={`ml-4 h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-gray-600">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Got questions? We have answers.
          </p>
        </div>

        {/* Accordion */}
        <div className="mt-12">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              open={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
