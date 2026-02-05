import Image from "next/image";
import Link from "next/link";
import type { ContentItem } from "../lib/content";
import logoCatalog from "../logo/logo_catalog.jpeg";

type Props = {
  item: ContentItem;
};

export default function ContentCard({ item }: Props) {
  const tags = item.tags.slice(0, 2);
  const extraTags = Math.max(item.tags.length - tags.length, 0);
  const creator =
    item.creator.length > 18
      ? `${item.creator.slice(0, 8)}...${item.creator.slice(-6)}`
      : item.creator;

  return (
    <Link
      href={`/content/${item.id}`}
      className="group flex flex-col gap-5 rounded-3xl border border-[#1f2937] bg-[#0f172a]/70 p-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.7)] backdrop-blur transition hover:-translate-y-1 hover:border-[#2dd4bf] hover:shadow-[0_40px_80px_-40px_rgba(45,212,191,0.25)]"
    >
      <div className="relative h-36 overflow-hidden rounded-2xl border border-[#1f2937]">
        <Image
          src={logoCatalog}
          alt="StreamPay catalog cover"
          fill
          className="object-cover"
          sizes="(min-width: 1280px) 360px, (min-width: 768px) 45vw, 90vw"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff33,transparent_70%)] opacity-50" />
        <span className="absolute left-4 top-4 rounded-full border border-[#1f2937] bg-[#0b0f1a]/70 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[#94a3b8]">
          On-chain
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-[#94a3b8]">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#1f2937] bg-[#0b0f1a]/60 px-3 py-1"
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 ? (
            <span className="rounded-full border border-[#1f2937] bg-[#0b0f1a]/60 px-3 py-1">
              +{extraTags}
            </span>
          ) : null}
        </div>
        <h3
          className="text-xl font-semibold text-[#e5e7eb]"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
          }}
        >
          {item.title}
        </h3>
        <p
          className="text-sm text-[#9ca3af]"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
          }}
        >
          {item.description}
        </p>
        <span className="text-xs uppercase tracking-[0.3em] text-[#64748b]">
          {creator}
        </span>
      </div>
      <div className="mt-auto flex items-center justify-between text-xs text-[#94a3b8]">
        <span className="font-semibold text-[#2dd4bf]">
          {item.ratePer10sSui.toFixed(4)} SUI / 10s
        </span>
      </div>
    </Link>
  );
}
