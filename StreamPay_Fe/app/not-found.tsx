import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f6f3ee] px-6 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-[#6b6763]">
        404
      </p>
      <h1 className="text-4xl font-semibold text-[#0b2430]">
        Page not found
      </h1>
      <p className="max-w-md text-sm text-[#6b6763]">
        The content you are looking for does not exist yet. Head back to the
        catalog to explore premium PDFs.
      </p>
      <Link
        href="/catalog"
        className="rounded-full bg-[#0b2430] px-6 py-3 text-sm font-semibold text-white"
      >
        Back to catalog
      </Link>
    </div>
  );
}
