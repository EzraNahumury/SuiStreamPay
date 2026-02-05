export default function Footer() {
  return (
    <footer className="border-t border-[#1f2937] bg-[#0b0f1a] py-14 text-sm text-[#94a3b8]">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-10 rounded-3xl border border-[#1f2937] bg-[radial-gradient(circle_at_top,#1f1b3a,transparent_70%)] p-10 md:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">
              Let&apos;s start building
            </span>
            <h2 className="text-3xl font-semibold text-[#e5e7eb] md:text-4xl">
              Bring your premium PDFs on-chain.
            </h2>
            <p className="text-sm text-[#9ca3af]">
              Start streaming access with instant settlements and transparent
              creator payouts.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/orgs/SuiStreamPay69/"
                className="rounded-full border border-[#1f2937] px-6 py-3 text-sm font-semibold text-[#e5e7eb]"
              >
                Creator docs
              </a>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-[#e5e7eb]">Quick Link</h3>
              <div className="mt-3 grid gap-2 text-xs uppercase tracking-[0.2em]">
                <span>About</span>
                <span>How it works</span>
                <span>Roadmap</span>
                <span>FAQ</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#e5e7eb]">Community</h3>
              <div className="mt-3 grid gap-2 text-xs uppercase tracking-[0.2em]">
                <span>Documentation</span>
                <span>Web3ID</span>
                <span>Linktree</span>
                <span>Contact</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-[#1f2937] pt-6 text-xs text-[#6b7280] md:flex-row">
          <span>© 2026 StreamPay Network. All rights reserved.</span>
          <div className="flex gap-4 uppercase tracking-[0.2em]">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
