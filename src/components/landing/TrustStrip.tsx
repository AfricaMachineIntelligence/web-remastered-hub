import { Shield, Users, Heart, BadgeCheck, CalendarCheck } from "lucide-react";

const trustItems = [
  { icon: Shield, text: "Safe & gentle treatments" },
  { icon: Users, text: "Professional therapists" },
  { icon: Heart, text: "Family-friendly" },
  { icon: BadgeCheck, text: "Transparent pricing" },
  { icon: CalendarCheck, text: "Easy online booking" },
];

export const TrustStrip = () => {
  return (
    <section
      className="py-6"
      style={{
        background: "rgba(250,245,239,0.6)",
        borderTop: "1px solid rgba(180,120,60,0.1)",
        borderBottom: "1px solid rgba(180,120,60,0.1)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
          {trustItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <item.icon className="h-4 w-4" style={{ color: "#b47838" }} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
