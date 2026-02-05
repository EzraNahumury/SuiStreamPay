"use client";

import { useParams, useSearchParams } from "next/navigation";
import Footer from "../../components/Footer";
import Nav from "../../components/Nav";
import ReaderClient from "../../components/ReaderClient";
import { useContentItem } from "../../lib/hooks";

export default function ReaderPage() {
  const params = useParams<{ id: string }>();
  const contentId = params?.id ?? "";
  const { item, loading } = useContentItem(contentId);
  const searchParams = useSearchParams();
  const depositParam = searchParams.get("deposit");
  const initialDeposit = depositParam ? Number(depositParam) : undefined;

  if (!item && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f1a]">
        <p className="text-sm text-[#94a3b8]">Content not found.</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f1a]">
        <p className="text-sm text-[#94a3b8]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-[#e5e7eb]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <Nav />
        <ReaderClient item={item} initialDeposit={initialDeposit} />
      </div>
      <Footer />
    </div>
  );
}
