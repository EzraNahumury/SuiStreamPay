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

  const form = await request.formData();
  const file = form.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing PDF file." }, { status: 400 });
  }

  const payload = new FormData();
  payload.append("file", file, file.name || "document.pdf");

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
    },
    body: payload,
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.details ?? "Pinata upload failed." },
      { status: response.status }
    );
  }

  return NextResponse.json({
    cid: data.IpfsHash,
    size: data.PinSize,
    timestamp: data.Timestamp,
  });
}
