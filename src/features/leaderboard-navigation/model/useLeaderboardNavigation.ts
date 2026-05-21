"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { LeaderboardEntry } from "@/entities/leaderboard";
import { getSearchableLabel } from "@/entities/leaderboard";

type Options = {
  items: LeaderboardEntry[];
  viewerRank?: LeaderboardEntry;
  pageSize: number;
  pageOffset: number;
  totalItems: number;
};

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

export function useLeaderboardNavigation({
  items,
  viewerRank,
  pageSize,
  pageOffset,
  totalItems,
}: Options) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQueryState] = useState("");

  const normalizedQuery = normalizeQuery(query);
  const visibleItems = useMemo(() => {
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((entry) => getSearchableLabel(entry).includes(normalizedQuery));
  }, [items, normalizedQuery]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(
    Math.max(Math.floor(pageOffset / pageSize) + 1, 1),
    totalPages,
  );

  const navigateToPage = useCallback(
    (nextPage: number) => {
      const normalizedPage = Math.min(Math.max(nextPage, 1), totalPages);
      if (normalizedPage === currentPage) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(normalizedPage));
      params.set("pageSize", String(pageSize));
      params.delete("limit");
      params.delete("offset");

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [currentPage, pageSize, pathname, router, searchParams, totalPages],
  );

  return {
    query,
    page: currentPage,
    totalPages,
    visibleItems,
    canGoPrevPage: currentPage > 1,
    canGoNextPage: currentPage < totalPages,
    setQuery: (nextQuery: string) => {
      setQueryState(nextQuery);
    },
    goToEntry: (userId: string) => {
      const visibleItemIndex = visibleItems.findIndex((entry) => entry.userId === userId);
      if (visibleItemIndex >= 0) {
        return true;
      }

      const pageItemIndex = items.findIndex((entry) => entry.userId === userId);
      if (pageItemIndex >= 0) {
        setQueryState("");
        return true;
      }

      if (viewerRank && viewerRank.userId === userId) {
        setQueryState("");
        navigateToPage(Math.floor((viewerRank.rank - 1) / pageSize) + 1);
        return true;
      }

      return false;
    },
    goToPrevPage: () => navigateToPage(currentPage - 1),
    goToNextPage: () => navigateToPage(currentPage + 1),
  };
}
