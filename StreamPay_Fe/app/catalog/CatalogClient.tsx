"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ContentCard from "../components/ContentCard";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import { useContentCatalog } from "../lib/hooks";
import { useWalletConnection } from "@mysten/dapp-kit-react";

export default function CatalogClient() {
  const router = useRouter();
  const connection = useWalletConnection();
  const { items } = useContentCatalog();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    if (!normalizedQuery) {
      return items;
    }
    return items.filter((item) => {
      const haystack = [
        item.title,
        item.description,
        item.creator,
        item.tags?.join(" ") ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [items, normalizedQuery]);
  const totalPages = Math.max(Math.ceil(filteredItems.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [currentPage, filteredItems]);

  useEffect(() => {
    if (!connection.isConnected) {
      router.replace("/");
    }
  }, [connection.isConnected, router]);

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-[#e5e7eb]">
      <div className="relative overflow-hidden border-b border-[#1f2937]">
        <div className="absolute -left-24 top-[-140px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_top,#1f766e,transparent_70%)] opacity-30" />
        <div className="absolute right-[-160px] top-16 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_top,#1f3a8a,transparent_70%)] opacity-25" />
        <div className="absolute bottom-[-180px] left-[30%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle_at_top,#0f172a,transparent_70%)] opacity-70" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-10">
          <Nav />
          <header className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#94a3b8]">
              <span>Browse</span>
              <span className="h-1 w-1 rounded-full bg-[#2dd4bf]" />
              <span>Live catalog</span>
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-semibold md:text-5xl">
                Premium PDF catalog
              </h1>
              <p className="max-w-2xl text-sm text-[#94a3b8] md:text-base">
                Curated knowledge drops priced per time. Start a session, pay as
                you read, and exit anytime for a refund.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="group flex w-full flex-1 items-center gap-3 rounded-full border border-[#1f2937] bg-[#0f172a]/80 px-4 py-2 text-sm text-[#e5e7eb] shadow-[0_16px_30px_-24px_rgba(0,0,0,0.7)] backdrop-blur transition hover:border-[#2dd4bf] focus-within:border-[#2dd4bf]">
                <svg
                  className="h-4 w-4 text-[#94a3b8] transition group-hover:text-[#2dd4bf]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M20 20L17 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search title, tags, or creator"
                  className="w-full bg-transparent text-sm text-[#e5e7eb] placeholder:text-[#64748b] focus:outline-none"
                />
                {normalizedQuery ? (
                  <span className="rounded-full border border-[#1f2937] bg-[#111827] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#94a3b8]">
                    {filteredItems.length} results
                  </span>
                ) : null}
              </label>
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#94a3b8]">
                <span className="rounded-full border border-[#1f2937] px-3 py-1">
                  On-chain
                </span>
                <span className="rounded-full border border-[#1f2937] px-3 py-1">
                  Instant settle
                </span>
              </div>
            </div>
          </header>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-[#1f2937] bg-[#111827] p-10 text-center text-sm text-[#94a3b8]">
            No on-chain content yet. Create a premium PDF to show it here.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-[#1f2937] bg-[#111827] p-10 text-center text-sm text-[#94a3b8]">
            No results found. Try a different keyword.
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {pagedItems.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.3em] text-[#94a3b8]">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-full border border-[#1f2937] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#e5e7eb] disabled:opacity-40"
              >
                Prev
              </button>
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const isActive = pageNumber === currentPage;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] ${
                        isActive
                          ? "border-[#2dd4bf] bg-[#2dd4bf] text-[#0b0f1a]"
                          : "border-[#1f2937] text-[#e5e7eb]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="rounded-full border border-[#1f2937] px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#e5e7eb] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
