"use client";

import Link from "next/link";
import { useContext } from "react";
import { useWalletConnection } from "@mysten/dapp-kit-react";
import { DAppKitReadyContext } from "../lib/dappkit";

function NavLinksConnected() {
  const connection = useWalletConnection();

  if (!connection.isConnected) {
    return null;
  }

  return (
    <div className="hidden items-center gap-6 text-sm font-medium text-[#94a3b8] md:flex">
      <Link className="hover:text-white" href="/catalog">
        Catalog
      </Link>
      <Link className="hover:text-white" href="/creator">
        Creator
      </Link>
    </div>
  );
}

export default function NavLinksClient() {
  const ready = useContext(DAppKitReadyContext);

  if (!ready) {
    return null;
  }

  return <NavLinksConnected />;
}
