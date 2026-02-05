"use client";

import { useEffect, useState } from "react";
import type { ContentItem } from "./content";

export const useContentCatalog = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await fetch("/api/content");
        const data = await response.json();
        if (mounted && data?.items?.length) {
          setItems(data.items);
        }
      } catch {
        // keep fallback
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { items, loading };
};

export const useContentItem = (id: string) => {
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) {
        if (mounted) {
          setItem(null);
          setLoading(false);
        }
        return;
      }
      if (mounted) {
        setLoading(true);
      }
      try {
        const response = await fetch(`/api/content/${id}`);
        if (response.ok) {
          const data = await response.json();
          if (mounted) {
            setItem(data?.item ?? null);
          }
        }
      } catch {
        // keep fallback
      }

      if (mounted) {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  return { item, loading };
};
