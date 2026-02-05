"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import WalletButton from "./WalletButton";
import logo from "../logo/logo.png";

const NavLinksClient = dynamic(() => import("./NavLinksClient"), {
  ssr: false,
});

export default function Nav() {
  return (
    <nav className="flex items-center justify-between gap-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[#e5e7eb]"
      >
        <span className="flex h-16 w-16 items-center justify-center">
          <Image
            src={logo}
            alt="StreamPay"
            className="h-16 w-16 object-contain"
            priority
          />
        </span>
        StreamPay
      </Link>
      <NavLinksClient />
      <WalletButton />
    </nav>
  );
}
