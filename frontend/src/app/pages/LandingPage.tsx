import { useNavigate } from "react-router";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Package,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "98%", label: "On-Time Delivery" },
  { value: "24/7", label: "System Availability" },
  { value: "3×", label: "Faster Processing" },
];

const FEATURES = [
  {
    icon: Clock,
    title: "Smart Assignment",
    desc: "Route requests to the right courier based on availability and workload — no manual dispatching.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Cost tracking, deadline compliance, and satisfaction scores in a live dashboard.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    desc: "Tailored views for Administrators, Collaborators, and Couriers — everyone sees what they need.",
  },
  {
    icon: Zap,
    title: "Full Lifecycle Tracking",
    desc: "From submission to proof-of-delivery — every state change is logged and visible.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    desc: "JWT authentication, HttpOnly cookies, and role guards protect every endpoint.",
  },
  {
    icon: Package,
    title: "File Attachments",
    desc: "Attach documents and photos to requests — discharge photos confirm delivery.",
  },
];

const BENEFITS = [
  {
    title: "Automated Workflow",
    desc: "From request creation to completion with audit trail on every transition.",
  },
  {
    title: "Performance Tracking",
    desc: "Monitor courier scores, on-time rates, and execution times in real-time.",
  },
  {
    title: "Cost Management",
    desc: "Compare estimated vs actual spend per category with variance analysis.",
  },
  {
    title: "Full Traceability",
    desc: "Every state change, assignment, and survey response is permanently logged.",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function Nav({ onSignIn }: { onSignIn: () => void }) {
  return (
    <nav
      className="relative z-10 mx-auto flex max-w-7xl
                    items-center justify-between px-6 py-5"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center
                        rounded-lg bg-[#FFE600]"
        >
          <span className="text-sm font-black text-[#2E2E38]">EY</span>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">EY Errands</p>
          <p
            className="text-[10px] font-medium tracking-widest
                        text-[#FFE600]/70 uppercase"
          >
            Management System
          </p>
        </div>
      </div>

      <Button
        onClick={onSignIn}
        className="bg-[#FFE600] text-[#2E2E38] hover:bg-[#ffd700]
                   font-semibold shadow-none"
      >
        Sign In
      </Button>
    </nav>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="rounded-xl border border-white/10 bg-white/5
                    px-6 py-5 backdrop-blur-sm"
    >
      <p className="text-3xl font-black text-[#FFE600]">{value}</p>
      <p className="mt-1 text-sm text-gray-400">{label}</p>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="group rounded-2xl border border-gray-100 bg-white
                    p-7 shadow-sm transition-all duration-200
                    hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center
                      rounded-xl bg-[#FFE600]/15 transition-colors
                      group-hover:bg-[#FFE600]/25"
      >
        <Icon className="h-5 w-5 text-[#2E2E38]" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-[#2E2E38]">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
    </div>
  );
}

function BenefitRow({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center
                      justify-center rounded-full bg-[#FFE600]"
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-[#2E2E38]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#2E2E38]">{title}</p>
        <p className="mt-0.5 text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const navigate = useNavigate();
  const signIn = () => navigate("/login");

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#2E2E38]">
        {/* Subtle diagonal grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#FFE600 0,#FFE600 1px," +
              "transparent 1px,transparent 24px)",
          }}
        />

        {/* Yellow glow — top right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32
                     h-96 w-96 rounded-full bg-[#FFE600]/10 blur-3xl"
        />

        <Nav onSignIn={signIn} />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16">
          <div className="grid lg:items-stretch gap-12 lg:grid-cols-2">
            {/* Left — text content */}
            <div>
              {/* Eyebrow */}
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full
                      border border-[#FFE600]/30 bg-[#FFE600]/10
                      px-4 py-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFE600]" />
                <span className="text-xs font-medium tracking-wide text-[#FFE600]">
                  Internal Enterprise Platform
                </span>
              </div>

              {/* Headline */}
              <h1
                className="text-5xl font-black leading-[1.1]
                     tracking-tight text-white"
              >
                Streamline Your{" "}
                <span className="text-[#FFE600]">Errand Operations</span> Across
                EY
              </h1>
              {/* Description */}
              <p className="mt-6 text-lg leading-relaxed text-gray-300">
                A purpose-built platform for EY to manage, assign, and track
                internal errands — from request to proof of delivery — with full
                visibility for every stakeholder.
              </p>

              {/* CTAs */}
              <div className="mt-5 mb-5 flex flex-wrap gap-3">
                <Button
                  onClick={signIn}
                  size="lg"
                  className="bg-[#FFE600] text-[#2E2E38] hover:bg-[#ffd700]
                     font-bold shadow-none gap-2"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 bg-transparent text-white
                     hover:bg-white/10 hover:text-white shadow-none"
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  See Features
                </Button>
              </div>

              {/* Stats row */}
              <div className="mt-auto grid grid-cols-3 gap-4">
                {STATS.map((s) => (
                  <StatPill key={s.label} {...s} />
                ))}
              </div>
            </div>

            {/* Right — mock dashboard card */}
            <div className="relative hidden lg:flex lg:flex-col">
              {/* Glow behind card */}
              <div
                className="absolute -inset-4 rounded-3xl
                      bg-[#FFE600]/8 blur-3xl"
              />

              <div
                className="relative flex flex-col h-full rounded-2xl
                    border border-white/10 bg-white/5 p-6
                    backdrop-blur-sm"
              >
                {/* Window chrome */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  <div className="ml-2 h-4 flex-1 rounded bg-white/10" />
                </div>

                {/* Stat cards */}
                <div className="mb-4 grid grid-cols-3 gap-3">
                  {[
                    { label: "Total", value: "248", color: "bg-white" },
                    { label: "Active", value: "12", color: "bg-[#FFE600]" },
                    { label: "Done", value: "236", color: "bg-emerald-400" },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className="rounded-xl border border-white/10
                         bg-white/5 p-3"
                    >
                      <div
                        className={`mb-1.5 h-1.5 w-5 rounded-full ${c.color}`}
                      />
                      <p className="text-xl font-black text-white">{c.value}</p>
                      <p className="text-[10px] text-gray-400">{c.label}</p>
                    </div>
                  ))}
                </div>

                {/* Table rows */}
                <div className="flex-1 space-y-2 mt-4">
                  {[
                    {
                      title: "Office supplies procurement",
                      status: "Completed",
                      color: "bg-emerald-400/20 text-emerald-300",
                    },
                    {
                      title: "IT equipment pickup",
                      status: "In Progress",
                      color: "bg-blue-400/20 text-blue-300",
                    },
                    {
                      title: "Travel documents — visa",
                      status: "Pending",
                      color: "bg-amber-400/20 text-amber-300",
                    },
                    {
                      title: "Facilities maintenance",
                      status: "Assigned",
                      color: "bg-purple-400/20 text-purple-300",
                    },
                  ].map((r) => (
                    <div
                      key={r.title}
                      className="flex items-center justify-between
                         rounded-lg bg-white/5 px-3 py-2.5"
                    >
                      <p
                        className="truncate text-xs font-medium
                            text-gray-300 max-w-[160px]"
                      >
                        {r.title}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5
                                text-[10px] font-semibold ${r.color}`}
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* EY badge */}
                <div
                  className="mt-4 flex items-center gap-2 border-t
                      border-white/10 pt-4"
                >
                  <div
                    className="flex h-5 w-5 items-center justify-center
                          rounded bg-[#FFE600]"
                  >
                    <span className="text-[8px] font-black text-[#2E2E38]">
                      EY
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">EY Errands Management</p>
                  <div className="ml-auto flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-emerald-400">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="bg-[#f8f8fa] py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p
              className="mb-2 text-xs font-semibold uppercase
                          tracking-widest text-[#FFE600]
                          [text-shadow:0_0_20px_#FFE60066]"
            >
              Capabilities
            </p>
            <h2 className="text-4xl font-black text-[#2E2E38]">
              Everything You Need
            </h2>
            <p className="mt-3 text-gray-500">
              Powerful features designed for an enterprise operations team
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Why EY Errands ────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-stretch gap-16 md:grid-cols-2">
            {/* Left — benefits */}
            <div className="flex flex-col">
              <p
                className="mb-2 text-xs font-semibold uppercase
                            tracking-widest text-[#FFE600]"
              >
                Why EY Errands
              </p>
              <h2 className="mb-8 text-4xl font-black text-[#2E2E38]">
                Built for How EY Works
              </h2>
              <div className="space-y-5">
                {BENEFITS.map((b) => (
                  <BenefitRow key={b.title} {...b} />
                ))}
              </div>
              <Button
                onClick={signIn}
                className="mt-auto w-fit bg-[#2E2E38] text-white
                 hover:bg-[#1a1a24] font-semibold gap-2"
              >
                Access the Platform
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Right — request lifecycle timeline */}
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-3xl
                  bg-[#FFE600]/8 blur-2xl"
              />

              <div
                className="relative rounded-2xl border border-gray-100
                  bg-white p-8 shadow-xl"
              >
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#2E2E38]">
                    Request Lifecycle
                  </p>
                  <span
                    className="rounded-full bg-emerald-50 px-2.5 py-1
                       text-xs font-medium text-emerald-600"
                  >
                    Live tracking
                  </span>
                </div>

                {/* Timeline steps */}
                <div className="space-y-0">
                  {[
                    {
                      step: "01",
                      title: "Request Submitted",
                      desc: "Collaborator submits with deadline and attachments",
                      status: "done",
                      time: "09:00",
                    },
                    {
                      step: "02",
                      title: "Assigned to Courier",
                      desc: "Admin assigns based on availability",
                      status: "done",
                      time: "09:14",
                    },
                    {
                      step: "03",
                      title: "In Progress",
                      desc: "Courier started — location tracked",
                      status: "active",
                      time: "09:31",
                    },
                    {
                      step: "04",
                      title: "Completed",
                      desc: "Proof of delivery photo uploaded",
                      status: "pending",
                      time: "—",
                    },
                    {
                      step: "05",
                      title: "Survey Submitted",
                      desc: "Collaborator rates the service",
                      status: "pending",
                      time: "—",
                    },
                  ].map((item, i, arr) => (
                    <div key={item.step} className="flex gap-4">
                      {/* Left — indicator + line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center
                            justify-center rounded-full text-xs font-bold
                            ${
                              item.status === "done"
                                ? "bg-[#2E2E38] text-[#FFE600]"
                                : item.status === "active"
                                  ? "bg-[#FFE600] text-[#2E2E38] ring-4 ring-[#FFE600]/20"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                        >
                          {item.status === "done" ? "✓" : item.step}
                        </div>
                        {i < arr.length - 1 && (
                          <div
                            className={`mt-1 w-px flex-1 mb-1
                              ${
                                item.status === "done"
                                  ? "bg-[#2E2E38]/20"
                                  : "bg-gray-100"
                              }`}
                            style={{ minHeight: "24px" }}
                          />
                        )}
                      </div>

                      {/* Right — content */}
                      <div
                        className={`pb-5 flex-1 flex items-start
                          justify-between gap-2
                          ${i === arr.length - 1 ? "pb-0" : ""}`}
                      >
                        <div>
                          <p
                            className={`text-sm font-semibold
                            ${
                              item.status === "pending"
                                ? "text-gray-400"
                                : "text-[#2E2E38]"
                            }`}
                          >
                            {item.title}
                          </p>
                          <p
                            className={`mt-0.5 text-xs
                            ${
                              item.status === "pending"
                                ? "text-gray-300"
                                : "text-gray-500"
                            }`}
                          >
                            {item.desc}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-xs tabular-nums
                             ${
                               item.status === "active"
                                 ? "font-semibold text-[#2E2E38]"
                                 : "text-gray-400"
                             }`}
                        >
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div
                  className="mt-6 flex items-center gap-2 rounded-lg
                    bg-amber-50 px-3 py-2.5"
                >
                  <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <p className="text-xs text-amber-700">
                    Step 3 of 5 — courier en route
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="bg-[#2E2E38] py-20 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-black text-white">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-gray-400">
            Sign in with your EY credentials to access the platform.
          </p>
          <Button
            onClick={signIn}
            size="lg"
            className="mt-8 bg-[#FFE600] text-[#2E2E38] hover:bg-[#ffd700]
                       font-bold shadow-none gap-2"
          >
            Sign In to EY Errands
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-[#1a1a24] px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div
            className="flex flex-col items-center justify-between
                          gap-4 sm:flex-row"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-7 w-7 items-center justify-center
                              rounded bg-[#FFE600]"
              >
                <span className="text-[10px] font-black text-[#2E2E38]">
                  EY
                </span>
              </div>
              <span className="text-sm font-medium text-gray-400">
                EY Errands Management
              </span>
            </div>
            <div className="text-center text-xs text-gray-600">
              <p>© 2026 Ernst & Young. All rights reserved.</p>
              <p className="mt-0.5 italic">Building a better working world</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
