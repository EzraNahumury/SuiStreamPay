"use client";

import dynamic from "next/dynamic";

const WalletButtonClient = dynamic(() => import("./WalletButtonClient"), {
  ssr: false,
  loading: () => (
    <button >
      Connect Wallet
    </button>
  ),
});

export default function WalletButton() {
  return <WalletButtonClient />;
}
