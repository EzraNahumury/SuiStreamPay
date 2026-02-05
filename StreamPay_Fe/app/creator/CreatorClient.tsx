"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletConnection } from "@mysten/dapp-kit-react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import CreatorUploadForm from "../components/CreatorUploadForm";

export default function CreatorClient() {
  const router = useRouter();
  const connection = useWalletConnection();

  useEffect(() => {
    if (!connection.isConnected) {
      router.replace("/");
    }
  }, [connection.isConnected, router]);

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-[#e5e7eb]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <Nav />
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#94a3b8]">
              Creator console
            </p>
            <h1 className="text-4xl font-semibold md:text-5xl">
              Publish premium PDFs with streaming revenue.
            </h1>
            <p className="text-base text-[#94a3b8] md:text-lg">
              Upload to IPFS via Pinata, set a per-10-second rate, and collect
              revenue to your creator vault.
            </p>
            <div className="grid gap-4 rounded-3xl border border-[#1f2937] bg-[#111827] p-6 text-sm text-[#94a3b8]">
              <div className="flex items-center justify-between">
                <span>Listing fee</span>
                <span className="font-semibold text-[#e5e7eb]">0.01 SUI</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Settlement</span>
                <span className="font-semibold text-[#e5e7eb]">Every 10s</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vault withdrawals</span>
                <span className="font-semibold text-[#e5e7eb]">Anytime</span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-[#1f2937] bg-[#111827] p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.7)]">
            <h2 className="text-2xl font-semibold text-[#e5e7eb]">
              Upload your PDF
            </h2>
            <p className="mt-2 text-sm text-[#94a3b8]">
              This form posts to the Pinata proxy API in this app.
            </p>
            <div className="mt-6">
              <CreatorUploadForm />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
