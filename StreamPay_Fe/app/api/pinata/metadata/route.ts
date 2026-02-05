import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const pinataJwt = process.env.PINATA_JWT;

  if (!pinataJwt) {
    return NextResponse.json(
      { error: "Missing PINATA_JWT in environment." },
      { status: 500 }
    );
  }

  const body = await request.json();

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.details ?? "Pinata JSON pin failed." },
      { status: response.status }
    );
  }

  return NextResponse.json({
    cid: data.IpfsHash,
    size: data.PinSize,
    timestamp: data.Timestamp,
  });
}
