"use client";

import { useMemo, useState } from "react";
import type { LeaderboardEntry } from "@/entities/leaderboard";
import { getSearchableLabel } from "@/entities/leaderboard";

const DEFAULT_PAGE_SIZE = 10;

type Options = {
  items: LeaderboardEntry[];
  pageSize?: number;
};

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

export function useLeaderboardNavigation({
  items,
  pageSize = DEFAULT_PAGE_SIZE,
}: Options) {
  const [query, setQueryState] = useState("");
  const [page, setPage] = useState(1);

  const normalizedQuery = normalizeQuery(query);
  const filteredItems = useMemo(() => {
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((entry) => getSearchableLabel(entry).includes(normalizedQuery));
  }, [items, normalizedQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (currentPage - 1) * pageSize;
  const pageItems = filteredItems.slice(offset, offset + pageSize);

  return {
    query,
    page: currentPage,
    totalPages,
    filteredCount: filteredItems.length,
    pageItems,
    setQuery: (nextQuery: string) => {
      setQueryState(nextQuery);
      setPage(1);
    },
    goToEntry: (userId: string) => {
      const index = filteredItems.findIndex((entry) => entry.userId === userId);
      if (index >= 0) {
        setPage(Math.floor(index / pageSize) + 1);
        return true;
      }

      const globalIndex = items.findIndex((entry) => entry.userId === userId);
      if (globalIndex < 0) {
        return false;
      }

      setQueryState("");
      setPage(Math.floor(globalIndex / pageSize) + 1);
      return true;
    },
    goToPrevPage: () => setPage((currentPageValue) => Math.max(1, currentPageValue - 1)),
    goToNextPage: () =>
      setPage((currentPageValue) => Math.min(totalPages, currentPageValue + 1)),
  };
}
