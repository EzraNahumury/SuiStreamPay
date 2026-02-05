"use client";

import { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import {
  useCurrentAccount,
  useCurrentClient,
  useDAppKit,
  useWalletConnection,
} from "@mysten/dapp-kit-react";
import { appConfig, isChainConfigured } from "../lib/config";
import { parseSuiToMist } from "../lib/sui";

export default function CreatorUploadForm() {
  const account = useCurrentAccount();
  const connection = useWalletConnection();
  const dappKit = useDAppKit();
  const client = useCurrentClient();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ratePer10s, setRatePer10s] = useState(0.001);
  const [listingFee] = useState(0.01);
  const [publishedId, setPublishedId] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    state: "idle" | "uploading" | "success" | "error";
    message?: string;
  }>({ state: "idle" });

  const chainReady =
    isChainConfigured && connection.isConnected && Boolean(account);

  const verifyPlatform = async () => {
    if (!client) return { ok: false, message: "Sui client not ready." };
    try {
      const obj = await client.core.getObject({
        objectId: appConfig.platformId,
      });
      const objectType = obj.object?.type ?? "";
      const expectedPrefix = `${appConfig.packageId}::${appConfig.moduleName}::Platform`;
      if (!objectType.startsWith(expectedPrefix)) {
        return {
          ok: false,
          message:
            "Platform ID does not match the current package ID. Please re-init platform with the latest package.",
        };
      }
      return { ok: true, message: "" };
    } catch {
      return {
        ok: false,
        message:
          "Failed to load platform object. Check NEXT_PUBLIC_PLATFORM_ID and network.",
      };
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setStatus({ state: "error", message: "Please attach a PDF file first." });
      return;
    }
    if (!title.trim()) {
      setStatus({ state: "error", message: "Title is required." });
      return;
    }

    const data = new FormData();
    data.append("file", file);

    setStatus({ state: "uploading" });
    try {
      const response = await fetch("/api/pinata/upload", {
        method: "POST",
        body: data,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Upload failed.");
      }

      const pdfUri = `ipfs://${payload.cid}`;
      const metadataResponse = await fetch("/api/pinata/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          pdf_uri: pdfUri,
          rate_per_10s: ratePer10s,
        }),
      });
      const metadataPayload = await metadataResponse.json();
      if (!metadataResponse.ok) {
        throw new Error(metadataPayload?.error ?? "Metadata pin failed.");
      }

      if (chainReady) {
        const platformCheck = await verifyPlatform();
        if (!platformCheck.ok) {
          setStatus({ state: "error", message: platformCheck.message });
          return;
        }
        const tx = new Transaction();
        const feeMist = parseSuiToMist(listingFee);
        const rateMist = parseSuiToMist(ratePer10s);
        const [feeCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(feeMist)]);

        tx.moveCall({
          target: `${appConfig.packageId}::${appConfig.moduleName}::create_content`,
          arguments: [
            tx.object(appConfig.platformId),
            tx.pure.string(title),
            tx.pure.string(description),
            tx.pure.string(pdfUri),
            tx.pure.u64(rateMist),
            feeCoin,
            tx.object("0x6"),
          ],
        });
        tx.setGasBudget(100_000_000);

        const result = await dappKit.signAndExecuteTransaction({
          transaction: tx,
        });
        const txResult =
          result.$kind === "Transaction" ? result.Transaction : result.FailedTransaction;
        const createdIds =
          txResult.effects?.changedObjects
            ?.filter((change) => change.idOperation === "Created")
            .map((change) => change.objectId) ?? [];
        if (client && createdIds.length > 0) {
          const expectedPrefix = `${appConfig.packageId}::${appConfig.moduleName}::Content`;
          for (const objectId of createdIds) {
            try {
              const createdObj = await client.core.getObject({ objectId });
              const objectType = createdObj.object?.type ?? "";
              if (objectType.startsWith(expectedPrefix)) {
                setPublishedId(objectId);
                break;
              }
            } catch {}
          }
        }
      }

      setStatus({
        state: "success",
        message: `Uploaded. CID: ${payload.cid}`,
      });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Upload failed.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3">
        <label className="text-xs uppercase tracking-[0.2em] text-[#6b6763]">
          Title
        </label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-2xl border border-[#1f2937] bg-[#0f172a] px-4 py-3 text-sm text-[#e5e7eb]"
          placeholder="e.g. Sui Growth Playbook"
        />
      </div>
      <div className="grid gap-3">
        <label className="text-xs uppercase tracking-[0.2em] text-[#6b6763]">
          Description
        </label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-[110px] rounded-2xl border border-[#1f2937] bg-[#0f172a] px-4 py-3 text-sm text-[#e5e7eb]"
          placeholder="Short description of your premium PDF"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-[0.2em] text-[#6b6763]">
            Rate / 10s (SUI)
          </label>
          <input
            type="number"
            min="0.0001"
            step="0.0001"
            value={ratePer10s}
            onChange={(event) => setRatePer10s(Number(event.target.value))}
            className="rounded-2xl border border-[#1f2937] bg-[#0f172a] px-4 py-3 text-sm text-[#e5e7eb]"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-xs uppercase tracking-[0.2em] text-[#6b6763]">
            Listing fee (SUI)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={listingFee}
            readOnly
            className="cursor-not-allowed rounded-2xl border border-[#1f2937] bg-[#0f172a] px-4 py-3 text-sm text-[#94a3b8]"
          />
        </div>
        <p className="text-xs text-[#6b6763] md:col-start-2">
          Listing fee is set by platform (read-only).
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-[0.2em] text-[#6b6763]">
          Upload PDF
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="rounded-2xl border border-[#1f2937] bg-[#0f172a] px-4 py-3 text-sm text-[#e5e7eb]"
        />
      </div>
      <button
        type="submit"
        className="rounded-full bg-[#2dd4bf] px-6 py-3 text-sm font-semibold text-[#0b0f1a] transition hover:bg-[#22c1ad]"
      >
        Upload & Publish
      </button>
      {status.state !== "idle" && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            status.state === "success"
              ? "border-[#b9e5d0] bg-[#eaf8f1] text-[#0b6b52]"
              : status.state === "error"
              ? "border-[#f1c6c3] bg-[#fdeeee] text-[#a0211d]"
              : "border-[#efe7de] bg-[#faf7f2] text-[#6b6763]"
          }`}
        >
          {status.state === "uploading"
            ? "Uploading to Pinata..."
            : status.message}
        </div>
      )}
      {publishedId && (
        <div className="rounded-2xl border border-[#1f2937] bg-[#0f172a] px-4 py-3 text-xs text-[#e5e7eb]">
          Published content ID:{" "}
          <span className="font-semibold">{publishedId}</span>
        </div>
      )}
      {chainReady ? (
        <p className="text-xs text-[#6b6763]">
          On-chain publish enabled. You will sign a transaction after upload.
        </p>
      ) : (
        <p className="text-xs text-[#6b6763]">
          Connect wallet and set package/platform IDs to publish on-chain.
        </p>
      )}
    </form>
  );
}
