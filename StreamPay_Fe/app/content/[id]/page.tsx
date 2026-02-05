"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Footer from "../../components/Footer";
import Nav from "../../components/Nav";
import { useContentItem } from "../../lib/hooks";
import logoCatalog from "../../logo/logo_catalog.jpeg";

export default function ContentDetailPage() {
  const params = useParams<{ id: string }>();
  const contentId = params?.id ?? "";
  const { item, loading } = useContentItem(contentId);
  const [customDeposit, setCustomDeposit] = useState("");

  const depositOptions = item?.depositOptions ?? [];
  const selectedDeposit = useMemo(() => {
    if (customDeposit.trim() !== "") {
      const parsed = Number(customDeposit);
      return Number.isFinite(parsed) ? parsed : depositOptions[0] ?? 0.05;
    }
    return depositOptions[0] ?? 0.05;
  }, [customDeposit, depositOptions]);
  const activeDeposit =
    customDeposit.trim() === ""
      ? depositOptions[0] ?? selectedDeposit
      : Number(customDeposit);

  if (!item && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ee]">
        <p className="text-sm text-[#6b6763]">Content not found.</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f3ee]">
        <p className="text-sm text-[#6b6763]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-[#e5e7eb]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <Nav />
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 rounded-3xl border border-[#1f2937] bg-[#111827] p-5 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.7)]">
              <div className="relative h-44 w-full overflow-hidden rounded-3xl border border-[#1f2937]">
                <Image
                  src={logoCatalog}
                  alt="StreamPay catalog cover"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 520px, 90vw"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff33,transparent_70%)] opacity-50" />
              </div>
              <div className="grid gap-2 text-sm text-[#94a3b8]">
                <span className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">
                  Preview
                </span>
                <div className="grid gap-3">
                  {[1].map((page) => (
                    <div
                      key={page}
                      className="relative overflow-hidden rounded-2xl border border-[#1f2937]"
                    >
                      <iframe
                        src={`${item.pdfUrl}#page=${page}`}
                        className="h-[320px] w-full pointer-events-none"
                        title={`Preview ${item.title} page ${page}`}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0f1a]/80 via-transparent to-transparent" />
                    </div>
                  ))}
                </div>
                <span className="text-xs text-[#94a3b8]">
                  Free preview: page 1 only.
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-[#94a3b8]">
              {item.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <h1 className="text-4xl font-semibold md:text-5xl">
              {item.title}
            </h1>
            <p className="text-base text-[#94a3b8] md:text-lg">
              {item.description}
            </p>
            <div className="grid gap-3 rounded-2xl border border-[#1f2937] bg-[#111827] p-5 text-sm text-[#94a3b8]">
              <div className="flex items-center justify-between">
                <span>Creator</span>
                <span className="font-semibold text-[#e5e7eb]">
                  {item.creator}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rate</span>
                <span className="font-semibold text-[#e5e7eb]">
                  10 detik = {item.ratePer10sSui.toFixed(4)} SUI
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pages</span>
                <span className="font-semibold text-[#e5e7eb]">{item.pages}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Focus</span>
                <span className="font-semibold text-[#e5e7eb]">{item.tone}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6 rounded-3xl border border-[#1f2937] bg-[#111827] p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.7)]">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[#94a3b8]">
                Start reading
              </p>
              <h2 className="text-2xl font-semibold text-[#e5e7eb]">
                Choose your deposit
              </h2>
              <p className="text-sm text-[#94a3b8]">
                Sessions run in real time. Unused deposit will return to your
                wallet when you exit.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {depositOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setCustomDeposit(option.toString())}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                    activeDeposit === option
                      ? "border-[#2dd4bf] bg-[#2dd4bf] text-[#0b0f1a]"
                      : "border-[#1f2937] bg-[#0f172a] text-[#e5e7eb]"
                  }`}
                >
                  {option} SUI
                </button>
              ))}
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-[0.2em] text-[#94a3b8]">
                Custom deposit
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={customDeposit}
                onChange={(event) => setCustomDeposit(event.target.value)}
                className="rounded-2xl border border-[#1f2937] bg-[#0f172a] px-4 py-3 text-sm text-[#e5e7eb]"
                placeholder="0.05"
              />
            </div>
            <div className="rounded-2xl border border-[#1f2937] bg-[#0f172a] p-4 text-sm text-[#94a3b8]">
              <div className="flex items-center justify-between">
                <span>Selected deposit</span>
                <span className="font-semibold text-[#e5e7eb]">
                  {selectedDeposit.toFixed(2)} SUI
                </span>
              </div>
            </div>
            <Link
              href={`/reader/${item.id}?deposit=${selectedDeposit}`}
              className="rounded-full bg-[#2dd4bf] px-6 py-3 text-center text-sm font-semibold text-[#0b0f1a]"
            >
              Read now
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
