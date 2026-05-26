import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, Heart } from "lucide-react";

type Props = {
  variant?: "section" | "banner";
};

/**
 * "Buy a Voucher" call-to-action.
 * Sends guests through signup (with redirect to /vouchers) and signed-in users straight there.
 */
export const VoucherCTA = ({ variant = "section" }: Props) => {
  const href = "/buy-voucher";

  if (variant === "banner") {
    return (
      <div
        className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
        style={{
          background: "linear-gradient(135deg, rgba(180,120,60,0.10), rgba(180,120,60,0.04))",
          border: "1.5px solid rgba(180,120,60,0.25)",
        }}
      >
        <div
          className="inline-flex rounded-2xl p-3 text-white shrink-0"
          style={{ background: "#b47838" }}
        >
          <Gift className="h-6 w-6" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-gray-900">
            Gift Vouchers — for friends & family
          </h3>
          <p className="text-sm text-gray-600">
            Treat someone you love to a Palm Aura experience. Vouchers work
            across spa, salon, kids, and dining.
          </p>
        </div>
        <Button
          asChild
          className="font-semibold text-white hover:opacity-90 shrink-0"
          style={{ background: "#b47838" }}
        >
          <Link to={href}>
            <Gift className="h-4 w-4" />
            Buy a Voucher
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="py-16 px-6 bg-white">
      <div className="mx-auto max-w-5xl">
        <div
          className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center"
          style={{
            background:
              "linear-gradient(135deg, #faf5ef 0%, rgba(180,120,60,0.12) 100%)",
            border: "1.5px solid rgba(180,120,60,0.25)",
          }}
        >
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl"
            style={{ background: "rgba(180,120,60,0.18)" }}
          />
          <div className="relative">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold uppercase tracking-wider"
              style={{ background: "rgba(180,120,60,0.15)", color: "#b47838" }}
            >
              <Heart className="h-3.5 w-3.5" />
              The Gift of Wellness
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Buy a Voucher for Friends & Family
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-7">
              Birthdays, anniversaries, or just because — gift a Palm Aura
              experience. Redeemable across all our services from spa and
              salon to kids and dining.
            </p>
            <Button
              asChild
              size="lg"
              className="font-semibold text-white text-base px-8 py-6 hover:opacity-90"
              style={{ background: "#b47838" }}
            >
              <Link to={href}>
                <Gift className="h-5 w-5" />
                Buy a Gift Voucher
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
