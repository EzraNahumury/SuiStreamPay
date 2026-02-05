import { NextResponse } from "next/server";
import { isChainConfigured } from "../../../lib/config";
import { createSuiClient } from "../../../lib/sui";
import { parseContentObject } from "../../../lib/chain";

type Context = {
  params: Promise<{ id: string }> | { id: string };
};

const toGatewayUrl = (uri: string) => {
  if (uri.startsWith("ipfs://")) {
    return `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`;
  }
  return uri;
};

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  if (!id || id === "undefined") {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (!isChainConfigured) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const client = createSuiClient();
    const obj = await client.getObject({
      id,
      options: { showContent: true },
    });
    if (!obj.data || obj.error) {
      throw new Error("not found");
    }
    const parsed = parseContentObject(obj.data);
    if (!parsed.objectId) {
      throw new Error("not found");
    }
    const item = {
      id: parsed.objectId,
      objectId: parsed.objectId,
      vaultId: parsed.vaultId,
      title: parsed.title || "Untitled",
      description: parsed.description || "No description yet.",
      creator: parsed.creator,
      ratePer10sSui: Number(parsed.ratePer10s) / 1_000_000_000,
      depositOptions: [0.05, 0.1, 0.5, 1],
      tags: ["on-chain"],
      pages: 0,
      tone: "On-chain drop",
      pdfUrl: toGatewayUrl(parsed.pdfUri || ""),
      cover: {
        from: "#0b6b52",
        to: "#0b2430",
      },
    };
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
