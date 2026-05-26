import { describe, expect, it } from "vitest";

import { RANKS } from "@/entities/rank";
import {
  getDesktopRowStyle,
  getRankAccentStyles,
  TABLE_CELL_CLASS,
  TABLE_HEADER_CLASS,
} from "@/views/ranking/model/rankPresentation";

describe("views/ranking/model/rankPresentation", () => {
  it("exposes stable table utility classes", () => {
    expect(TABLE_HEADER_CLASS).toContain("uppercase");
    expect(TABLE_CELL_CLASS).toContain("border-r");
  });

  it("returns dedicated accent styles for S tier", () => {
    const sTier = RANKS.find((rank) => rank.tier === "S");
    if (!sTier) {
      throw new Error("S tier rank fixture is missing");
    }

    const styles = getRankAccentStyles(sTier);

    expect(styles.tierBadge.color).toBe("#8A6500");
    expect(styles.bandPill.color).toBe("#8A6500");
    expect(styles.mobileCard.borderColor).toContain("184, 134, 11");
  });

  it("returns generic accent styles for non-S tiers", () => {
    const aTier = RANKS.find((rank) => rank.tier === "A");
    if (!aTier) {
      throw new Error("A tier rank fixture is missing");
    }

    const styles = getRankAccentStyles(aTier);

    expect(styles.tierBadge).toEqual({
      color: aTier.color,
      borderColor: `${aTier.color}44`,
      background: `${aTier.color}18`,
    });
    expect(styles.bandPill).toEqual({
      color: aTier.color,
      borderColor: `${aTier.color}40`,
      background: `${aTier.color}14`,
    });
    expect(styles.mobileCard.background).toContain(`${aTier.color}14`);
  });

  it("alternates desktop row background for even/odd rows", () => {
    expect(getDesktopRowStyle(0)).toEqual({
      background: "rgba(255,255,255,0.03)",
    });
    expect(getDesktopRowStyle(1)).toEqual({
      background: "rgba(255,255,255,0.015)",
    });
  });
});
