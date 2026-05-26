import { Search, UserPlus, CalendarCheck } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "1",
    title: "Browse Services & Prices",
    description:
      "Explore our adult wellness, kids spa, packages, and restaurant offerings — all with transparent pricing.",
  },
  {
    icon: UserPlus,
    step: "2",
    title: "Create Your Account",
    description:
      "Sign up in seconds. Add family members to book for the whole family in one session.",
  },
  {
    icon: CalendarCheck,
    step: "3",
    title: "Book & Pay Together",
    description:
      "Add multiple services, assign to family members, and checkout with one payment, one invoice.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How Signing Up Works
          </h2>
          <p className="text-lg text-gray-600">
            Simple family booking in three easy steps
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={idx} className="relative text-center">
              {idx < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-12 left-1/2 w-full h-0.5"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(180,120,60,0.3), rgba(180,120,60,0.1))",
                  }}
                />
              )}

              <div className="relative inline-flex mb-6">
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-full"
                  style={{ background: "rgba(180,120,60,0.08)" }}
                >
                  <step.icon className="h-10 w-10" style={{ color: "#b47838" }} />
                </div>
                <div
                  className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full text-white font-bold text-sm"
                  style={{ background: "#b47838" }}
                >
                  {step.step}
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
            style={{ background: "rgba(180,120,60,0.08)", color: "#9a6830" }}
          >
            <CalendarCheck className="h-4 w-4" />
            Family Booking: Add multiple services and checkout together
          </div>
        </div>
      </div>
    </section>
  );
};
