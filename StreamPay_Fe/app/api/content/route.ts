import { NextResponse } from "next/server";
import { appConfig, isChainConfigured } from "../../lib/config";
import { createSuiClient } from "../../lib/sui";
import { parseContentObject, parsePlatformContentIds } from "../../lib/chain";

const toGatewayUrl = (uri: string) => {
  if (uri.startsWith("ipfs://")) {
    return `https://gateway.pinata.cloud/ipfs/${uri.replace("ipfs://", "")}`;
  }
  return uri;
};

export async function GET() {
  if (!isChainConfigured) {
    return NextResponse.json({ items: [] });
  }

  try {
    const client = createSuiClient();
    const platform = await client.getObject({
      id: appConfig.platformId,
      options: { showContent: true },
    });
    const ids = parsePlatformContentIds(platform.data);
    if (ids.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const objects = await Promise.all(
      ids.map((id) =>
        client.getObject({
          id,
          options: { showContent: true },
        })
      )
    );

    const items = objects
      .map((obj) => parseContentObject(obj.data))
      .map((item) => ({
        id: item.objectId ?? item.title,
        objectId: item.objectId,
        vaultId: item.vaultId,
        title: item.title || "Untitled",
        description: item.description || "No description yet.",
        creator: item.creator,
        ratePer10sSui: Number(item.ratePer10s) / 1_000_000_000,
        depositOptions: [0.05, 0.1, 0.5, 1],
        tags: ["on-chain"],
        pages: 0,
        tone: "On-chain drop",
        pdfUrl: toGatewayUrl(item.pdfUri || ""),
        cover: {
          from: "#0b6b52",
          to: "#0b2430",
        },
      }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
