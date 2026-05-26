import { Link } from "react-router-dom";
import palmAuraLogo from "@/assets/palm-aura-logo.png";

const footerLinks = {
  services: [
    { label: "Lash Bar", href: "#lashes" },
    { label: "Barbershop", href: "#barber" },
    { label: "Kids Spa", href: "#kids" },
    { label: "Restaurant", href: "#restaurant" },
  ],
  company: [
    { label: "Pricing", href: "#pricing" },
    { label: "Packages", href: "#packages" },
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#" },
  ],
  account: [
    { label: "Sign Up", href: "/auth?mode=signup" },
    { label: "Log In", href: "/auth?mode=login" },
  ],
};

export const LandingFooter = () => {
  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer
      className="text-white py-16 px-6"
      style={{ background: "hsl(25,19%,12%)" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-5 md:gap-x-12 items-start">
          {/* Brand */}
          <div>
            <span className="font-brand text-5xl leading-none" style={{ color: "#b47838" }}>
              Palm Aura
            </span>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
              Your family's premium destination for wellness, beauty, and dining
              experiences.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#b47838")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                    }
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#b47838")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                    }
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              {footerLinks.account.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm transition-colors"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
                      (e.currentTarget.style.color = "#b47838")
                    }
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
                      (e.currentTarget.style.color = "rgba(255,255,255,0.5)")
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logo */}
          <div className="flex md:justify-center items-start">
            <div
              className="rounded-full p-1 bg-white/95 shadow-md"
              style={{ border: "2px solid rgba(255,255,255,0.95)" }}
            >
              <img
                src={palmAuraLogo}
                alt="Palm Aura logo"
                className="h-24 w-24 rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        <div
          className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            © 2026 Palm Aura. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#b47838")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
              }
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#b47838")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
              }
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
