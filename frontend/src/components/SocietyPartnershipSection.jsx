"use client";
import { useRouter } from "next/navigation";
import { Shield, Star, Zap, Check, Users, Building2, TrendingUp } from "lucide-react";

const PLANS = [
  {
    name: "Essential",
    price: "₹2,999",
    period: "/month",
    tagline: "Perfect for small societies",
    icon: Shield,
    color: "#4a9eff",
    highlight: false,
    features: [
      "Up to 50 flats covered",
      "5 service categories",
      "Basic priority support",
      "Monthly usage report",
      "Dedicated helpline number",
    ],
  },
  {
    name: "Comfort",
    price: "₹4,999",
    period: "/month",
    tagline: "Most popular for mid-size RWAs",
    icon: Star,
    color: "#CC0000",
    highlight: true,
    features: [
      "Up to 150 flats covered",
      "All 12 service categories",
      "Priority 24/7 support",
      "Weekly analytics dashboard",
      "Dedicated account manager",
      "Flat-wise billing portal",
    ],
  },
  {
    name: "Premium",
    price: "₹8,999",
    period: "/month",
    tagline: "Enterprise-grade for large complexes",
    icon: Zap,
    color: "#f5a623",
    highlight: false,
    features: [
      "Unlimited flats",
      "All service categories",
      "SLA-backed response time",
      "Real-time ops dashboard",
      "On-site coordinator",
      "Custom branding option",
      "API access for society app",
    ],
  },
];

const BENEFITS = [
  { icon: Building2, title: "100+ Societies Trust Us",   desc: "Already partnered across Delhi NCR, Mumbai, Bengaluru" },
  { icon: Users,     title: "Bulk Resident Onboarding",  desc: "All flats get activated in under 48 hours"            },
  { icon: TrendingUp, title: "Save Up to 30%",           desc: "Group pricing vs individual bookings"                 },
];

export default function SocietyPartnershipSection() {
  const router = useRouter();

  return (
    <section
      id="society-partnership"
      style={{ backgroundColor: "#111111", padding: "80px 0" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ── */}
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
            style={{ backgroundColor: "#2a0000", color: "#CC0000" }}
          >
            B2B Partnerships
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Housing Society{" "}
            <span style={{ color: "#CC0000" }}>Partnerships</span>
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: "#999999" }}>
            Empower every flat in your society with on-demand home services.
            One agreement, hundreds of happy residents.
          </p>
        </div>

        {/* ── Benefit Badges ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-xl p-4"
              style={{ backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" }}
            >
              <div
                className="flex-shrink-0 p-2 rounded-lg"
                style={{ backgroundColor: "#2a0000" }}
              >
                <Icon className="w-5 h-5" style={{ color: "#CC0000" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs mt-0.5" style={{ color: "#888888" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pricing Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className="relative rounded-2xl p-6 flex flex-col transition-transform duration-200 hover:-translate-y-1"
                style={{
                  backgroundColor: "#1a1a1a",
                  border: plan.highlight
                    ? `2px solid ${plan.color}`
                    : "1px solid #2a2a2a",
                  boxShadow: plan.highlight
                    ? `0 0 32px ${plan.color}22`
                    : "none",
                }}
              >
                {/* Popular badge */}
                {plan.highlight && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                    style={{ backgroundColor: plan.color, color: "#fff" }}
                  >
                    Most Popular
                  </span>
                )}

                {/* Plan icon + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="p-2 rounded-xl"
                    style={{ backgroundColor: `${plan.color}22` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: plan.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{plan.name} Plan</p>
                    <p className="text-xs" style={{ color: "#888888" }}>{plan.tagline}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm ml-1" style={{ color: "#888888" }}>{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "#cccccc" }}>
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => router.push("/society-partner")}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={
                    plan.highlight
                      ? { backgroundColor: plan.color, color: "#fff" }
                      : { backgroundColor: "#2a2a2a", color: "#cccccc" }
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = plan.color;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    if (!plan.highlight) {
                      e.currentTarget.style.backgroundColor = "#2a2a2a";
                      e.currentTarget.style.color = "#cccccc";
                    }
                  }}
                >
                  Partner With Us
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Bottom CTA Banner ── */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "linear-gradient(135deg, #1a0000 0%, #2a0000 100%)",
            border: "1px solid #CC0000",
          }}
        >
          <h3 className="text-xl font-bold text-white mb-2">
            Not sure which plan suits your society?
          </h3>
          <p className="text-sm mb-6" style={{ color: "#999999" }}>
            Fill in a quick form and our team will reach out with a custom quote within 24 hours.
          </p>
          <button
            onClick={() => router.push("/society-partner")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all"
            style={{ backgroundColor: "#CC0000", color: "#fff" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#8B0000")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#CC0000")}
          >
            <Building2 className="w-4 h-4" />
            Get a Free Consultation
          </button>
        </div>
      </div>
    </section>
  );
}