import { Link2, Share2, Code } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Link2,
    title: "Create a Collection Link",
    description:
      "Set up your project and generate a unique collection link in seconds. Customize the form with your branding.",
    color: "bg-[#6366f1]",
    textColor: "text-[#6366f1]",
    ringColor: "ring-[#6366f1]/20",
  },
  {
    number: 2,
    icon: Share2,
    title: "Share with Your Customers",
    description:
      "Send the link via email, embed it on your site, or share on social media. Customers submit testimonials effortlessly.",
    color: "bg-[#8b5cf6]",
    textColor: "text-[#8b5cf6]",
    ringColor: "ring-[#8b5cf6]/20",
  },
  {
    number: 3,
    icon: Code,
    title: "Embed Widgets on Your Site",
    description:
      "Choose from beautiful widget layouts, copy one line of code, and display testimonials anywhere on your website.",
    color: "bg-purple-600",
    textColor: "text-purple-600",
    ringColor: "ring-purple-600/20",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gray-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get started in minutes with three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16 grid gap-8 md:grid-cols-3 md:gap-12">
          {/* Connecting line (desktop) */}
          <div className="absolute top-16 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] hidden h-0.5 bg-gradient-to-r from-[#6366f1]/30 via-[#8b5cf6]/30 to-purple-600/30 md:block" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative text-center">
                {/* Number badge + icon */}
                <div className="mx-auto mb-6 flex flex-col items-center">
                  <div
                    className={`relative z-10 mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full ${step.color} text-white shadow-lg ring-4 ${step.ringColor}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${step.textColor} bg-white ring-2 ${step.ringColor}`}
                  >
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-600">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
