"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletConnection } from "@mysten/dapp-kit-react";
import { DAppKitReadyContext } from "../lib/dappkit";

function HomeGateConnected() {
  const router = useRouter();
  const connection = useWalletConnection();

  useEffect(() => {
    if (connection.isConnected) {
      router.replace("/catalog");
    }
  }, [connection.isConnected, router]);

  return null;
}

export default function HomeGateClient() {
  const ready = useContext(DAppKitReadyContext);

  if (!ready) {
    return null;
  }

  return <HomeGateConnected />;
}
