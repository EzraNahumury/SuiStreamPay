"use client";

import dynamic from "next/dynamic";

const CreatorClient = dynamic(() => import("./CreatorClient"), { ssr: false });

export default function CreatorClientWrapper() {
  return <CreatorClient />;
}
