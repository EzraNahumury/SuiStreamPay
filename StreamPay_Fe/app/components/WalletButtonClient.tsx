"use client";

import { ConnectButton, useCurrentClient, useWalletConnection } from "@mysten/dapp-kit-react";
import { useEffect, useState, type CSSProperties } from "react";

export default function WalletButtonClient() {
  const connection = useWalletConnection();
  const client = useCurrentClient();
  const [balance, setBalance] = useState<string | null>(null);
  const ZERO_BIGINT = BigInt(0);
  const MIST_PER_SUI = BigInt(1_000_000_000);
  const connectButtonStyle = {
    ["--background" as string]: "#ffffff",
    ["--foreground" as string]: "#0b0f1a",
    ["--primary" as string]: "transparent",
    ["--primary-foreground" as string]: "#ffffff",
    ["--secondary" as string]: "#ffffff",
    ["--secondary-foreground" as string]: "#0b0f1a",
    ["--border" as string]: "#e5e7eb",
    ["--ring" as string]: "#2dd4bf",
  } as CSSProperties;
  const connectButtonClass =
    "inline-flex rounded-full bg-gradient-to-r from-[#2dd4bf] via-[#38bdf8] to-[#6366f1] shadow-[0_14px_34px_-20px_rgba(45,212,191,0.7)]";

  useEffect(() => {
    if (!connection.isConnected || !connection.account || !client) {
      setBalance(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const coins = await client.core.listCoins({
          owner: connection.account!.address,
        });
        const total = coins.objects.reduce(
          (acc, coin) => acc + BigInt(coin.balance),
          ZERO_BIGINT
        );
        const whole = total / MIST_PER_SUI;
        const frac = (total % MIST_PER_SUI).toString().padStart(9, "0").slice(0, 4);
        const formatted = `${whole.toString()}.${frac}`;
        if (!cancelled) {
          setBalance(formatted);
        }
      } catch {
        if (!cancelled) {
          setBalance(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connection.isConnected, connection.account?.address, client]);

  if (connection.isConnected && connection.account) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-[#1f2937] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#e5e7eb]">
        {balance && (
          <span className="rounded-full border border-[#1f2937] bg-transparent px-2 py-1 text-[10px] font-semibold text-[#e5e7eb]">
            {balance} SUI
          </span>
        )}
        <ConnectButton
          className={`${connectButtonClass} text-[10px]`}
          style={connectButtonStyle}
        />
      </div>
    );
  }

  return (
    <ConnectButton className={connectButtonClass} style={connectButtonStyle} />
  );
}
