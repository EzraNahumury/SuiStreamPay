"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Footer from "./Footer";
import Nav from "./Nav";

const HomeGateClient = dynamic(() => import("./HomeGateClient"), { ssr: false });

export default function HomeClient() {
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-[#e5e7eb]">
      <HomeGateClient />
      <div className="relative overflow-hidden border-b border-[#1f2937]">
        <div className="absolute -left-24 top-[-140px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_top,#1f766e,transparent_70%)] opacity-40" />
        <div className="absolute right-[-120px] top-20 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_top,#1f3a8a,transparent_70%)] opacity-35" />
        <div className="absolute bottom-[-140px] left-[40%] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle_at_top,#0f172a,transparent_70%)] opacity-60" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-10">
          <Nav />
          <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">
                Sui Micro-Subscription Network
              </p>
              <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
                Pay-per-time access for premium PDFs.
              </h1>
              <p className="max-w-xl text-base text-[#9ca3af] md:text-lg">
                Deposit once, read for seconds or minutes, and settle instantly.
                No ads, no monthly lock-in. Creators get paid in real time.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 rounded-full border border-[#1f2937] bg-[#0f172a]/70 px-4 py-2 text-xs text-[#94a3b8]">
                  <Image
                    src="/assets/community-avatars.svg"
                    alt="Community members"
                    width={120}
                    height={40}
                    className="h-8 w-auto"
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-[#e5e7eb]">
                      5k+
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#94a3b8]">
                      Community members
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-[#1f2937] bg-[#111827] p-6 shadow-[0_40px_80px_-60px_rgba(0,0,0,0.8)]">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,#2dd4bf33,transparent_70%)]" />
              <div className="absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,#6366f133,transparent_70%)]" />
              <Image
                src="/assets/hero-orbits.svg"
                alt=""
                width={200}
                height={200}
                className="absolute right-8 top-16 h-40 w-40 opacity-30"
              />
              <div className="flex items-center justify-between text-sm text-[#94a3b8]">
                <span>Live session preview</span>
                <span className="rounded-full border border-[#1f2937] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#2dd4bf]">
                  Demo
                </span>
              </div>
              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-[#1f2937] bg-[#0f172a] p-4">
                  <div className="flex items-center gap-3 text-xs text-[#94a3b8]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#1f2937] bg-[#111827] text-[#2dd4bf]">
                      SP
                    </span>
                    Live checkpoint feed
                  </div>
                  <div className="mt-3 grid gap-2 text-[11px] text-[#94a3b8]">
                    <div className="flex items-center justify-between rounded-xl border border-[#1f2937] bg-[#0b0f1a] px-3 py-2">
                      <span>Session started</span>
                      <span className="text-[#2dd4bf]">00:10</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-[#1f2937] bg-[#0b0f1a] px-3 py-2">
                      <span>Checkpoint settled</span>
                      <span className="text-[#2dd4bf]">0.001 SUI</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#1f2937] bg-[#0f172a] p-4 text-sm text-[#cbd5f5]">
                  <div className="flex items-center justify-between">
                    <span>Deposit</span>
                    <span className="font-semibold">0.10 SUI</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span>Spent</span>
                    <span className="font-semibold">0.021 SUI</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span>Remaining</span>
                    <span className="font-semibold text-[#2dd4bf]">0.079 SUI</span>
                  </div>
                </div>
                <div className="relative rounded-2xl border border-[#1f2937] bg-[#0b0f1a] px-4 py-3 text-xs text-[#94a3b8]">
                  Connect wallet to unlock the catalog.
                  <Image
                    src="/assets/target.svg"
                    alt=""
                    width={120}
                    height={120}
                    className="absolute right-4 top-3 h-16 w-16 opacity-60"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">
            Why StreamPay
          </p>
          <h2 className="text-3xl font-semibold md:text-4xl">
            Built for micro-payments, optimized for creators.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Deposit once",
              body: "Users fund a session and pay only for time spent reading.",
            },
            {
              title: "Transparent split",
              body: "Fees settle into creator wallets on every checkpoint.",
            },
            {
              title: "Refund by design",
              body: "Unused deposit returns automatically when sessions end.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-[#1f2937] bg-[#111827] p-6 text-sm text-[#94a3b8] shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1f2937] bg-[#0f172a]">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#2dd4bf] to-[#6366f1]" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-[#e5e7eb]">
                {item.title}
              </h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 rounded-3xl border border-[#1f2937] bg-[#0f172a] p-6 text-sm text-[#94a3b8] md:grid-cols-4">
          {[
            { label: "Community members", value: "5k+" },
            { label: "Active sessions", value: "200" },
            { label: "Avg read time", value: "4h" },
            { label: "Avg spend", value: "$15" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2">
              <span className="text-2xl font-semibold text-[#e5e7eb]">
                {stat.value}
              </span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">
            How it works
          </p>
          <h2 className="text-3xl font-semibold md:text-4xl">Start in minutes.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Connect your wallet",
              body: "Use Slush wallet to unlock premium PDF sessions.",
            },
            {
              title: "Deposit & stream",
              body: "Pick a deposit, read in real-time, and track remaining balance.",
            },
            {
              title: "End & settle",
              body: "Creator is paid instantly, and unused balance is refunded.",
            },
          ].map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-[#1f2937] bg-[#111827] p-6 text-sm text-[#94a3b8]"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#1f2937] bg-[#0f172a] text-sm font-semibold text-[#2dd4bf]">
                {index + 1}
              </div>
              <div className="mb-4 flex h-28 items-center justify-center rounded-2xl border border-[#1f2937] bg-[#0f172a]">
                {index === 0 && (
                  <svg viewBox="0 0 120 120" className="h-20 w-20 text-[#2dd4bf]">
                    <rect x="18" y="30" width="84" height="60" rx="12" fill="#0b0f1a" stroke="#2dd4bf" strokeWidth="3" />
                    <circle cx="44" cy="60" r="10" fill="#2dd4bf" />
                    <rect x="60" y="52" width="34" height="6" rx="3" fill="#6366f1" />
                    <rect x="60" y="66" width="24" height="6" rx="3" fill="#1f2937" />
                  </svg>
                )}
                {index === 1 && (
                  <svg viewBox="0 0 120 120" className="h-20 w-20">
                    <rect x="20" y="24" width="80" height="72" rx="14" fill="#0b0f1a" stroke="#6366f1" strokeWidth="3" />
                    <path d="M38 72 L52 52 L68 64 L82 44" stroke="#2dd4bf" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="38" cy="72" r="4" fill="#2dd4bf" />
                    <circle cx="52" cy="52" r="4" fill="#2dd4bf" />
                    <circle cx="68" cy="64" r="4" fill="#2dd4bf" />
                    <circle cx="82" cy="44" r="4" fill="#2dd4bf" />
                  </svg>
                )}
                {index === 2 && (
                  <svg viewBox="0 0 120 120" className="h-20 w-20">
                    <circle cx="60" cy="60" r="34" fill="#0b0f1a" stroke="#2dd4bf" strokeWidth="3" />
                    <path d="M46 60 L56 70 L76 48" stroke="#2dd4bf" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold text-[#e5e7eb]">
                {step.title}
              </h3>
              <p className="mt-2">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">
            The Roadmap
          </p>
          <h2 className="text-3xl font-semibold md:text-4xl">2026 milestones</h2>
        </div>
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-6">
            {[
              {
                quarter: "Q1 2026",
                title: "Streaming MVP",
                body: "On-chain sessions, live settlement, and creator payouts.",
              },
              {
                quarter: "Q2 2026",
                title: "Creator analytics",
                body: "Revenue dashboard, reader retention, and pricing tools.",
              },
              {
                quarter: "Q3 2026",
                title: "Access control",
                body: "Encrypted previews, proxy streaming, and watermarking.",
              },
              {
                quarter: "Q4 2026",
                title: "Growth network",
                body: "Affiliate rewards and multi-creator bundles.",
              },
            ].map((phase) => (
              <div
                key={phase.quarter}
                className="rounded-3xl border border-[#1f2937] bg-[#0f172a]/70 p-6 text-sm text-[#94a3b8] shadow-[0_20px_40px_-30px_rgba(0,0,0,0.6)]"
              >
                <span className="text-xs uppercase tracking-[0.3em] text-[#2dd4bf]">
                  {phase.quarter}
                </span>
                <h3 className="mt-3 text-xl font-semibold text-[#e5e7eb]">
                  {phase.title}
                </h3>
                <p className="mt-2 text-sm text-[#94a3b8]">{phase.body}</p>
              </div>
            ))}
          </div>
          <div className="relative flex items-center justify-center">
            <div className="absolute -top-8 right-6 h-28 w-28 rounded-full bg-[radial-gradient(circle,#2dd4bf33,transparent_70%)]" />
            <div className="absolute -bottom-10 left-6 h-32 w-32 rounded-full bg-[radial-gradient(circle,#6366f133,transparent_70%)]" />
            <Image
              src="/assets/roadmap-tower.svg"
              alt="Roadmap tower"
              width={420}
              height={560}
              className="relative h-[420px] w-auto md:h-[520px]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">
            FAQ
          </p>
          <h2 className="text-3xl font-semibold md:text-4xl">
            Your questions, answered.
          </h2>
        </div>
        <div className="grid gap-4 rounded-3xl border border-[#1f2937] bg-[#111827] p-6 text-sm text-[#94a3b8]">
          {[
            {
              q: "What is StreamPay?",
              a: "StreamPay is a micro-subscription network for premium PDFs. Readers pay per time, and creators are paid instantly.",
            },
            {
              q: "How does pay-per-time work?",
              a: "You deposit once, start a session, and pay based on reading time. Checkpoints settle every 10-30 seconds.",
            },
            {
              q: "When do creators get paid?",
              a: "Creator earnings are transferred directly to their wallet at each checkpoint and when you end the session.",
            },
            {
              q: "Can I top up a session?",
              a: "Yes. Add more deposit at any time to keep reading without stopping the session.",
            },
            {
              q: "What happens if I exit early?",
              a: "Unused balance is refunded automatically when you end the session.",
            },
          ].map((item, index) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-[#1f2937] bg-[#0f172a] px-4 py-3"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-[#e5e7eb]">
                <span>{item.q}</span>
                <span className="text-[#2dd4bf] transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-[#94a3b8]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
