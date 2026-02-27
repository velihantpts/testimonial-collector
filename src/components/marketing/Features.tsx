import {
  Link2,
  LayoutGrid,
  Video,
  Sparkles,
  Mail,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Link2,
    title: "One-Click Collection",
    description:
      "Share a simple link and collect testimonials in minutes. No forms, no friction.",
    color: "bg-[#6366f1]",
  },
  {
    icon: LayoutGrid,
    title: "Beautiful Widgets",
    description:
      "Embed stunning testimonial widgets on your site with just one line of code.",
    color: "bg-[#8b5cf6]",
  },
  {
    icon: Video,
    title: "Video Testimonials",
    description:
      "Collect powerful video testimonials from your customers directly in-browser.",
    color: "bg-pink-500",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Variants",
    description:
      "Generate tweet, LinkedIn, and email versions of testimonials automatically.",
    color: "bg-amber-500",
  },
  {
    icon: Mail,
    title: "Email Reminders",
    description:
      "Send automated reminder emails to boost your collection rates effortlessly.",
    color: "bg-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track testimonial performance with real-time analytics and insights.",
    color: "bg-sky-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to collect &amp; showcase testimonials
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            A complete toolkit designed to turn customer love into social proof
            that converts.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg ${feature.color} text-white`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
