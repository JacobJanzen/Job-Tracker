import { filterProspectsByInterest, getNextStatus, validateProspect, isTerminalStatus, getOrderedStatusOptions, shouldCelebrate } from "./prospect-helpers";

describe("filterProspectsByInterest", () => {
  const prospects = [
    { id: 1, companyName: "Acme", interestLevel: "High", status: "Bookmarked" },
    { id: 2, companyName: "Beta", interestLevel: "Medium", status: "Bookmarked" },
    { id: 3, companyName: "Gamma", interestLevel: "Low", status: "Bookmarked" },
    { id: 4, companyName: "Delta", interestLevel: "High", status: "Applied" },
    { id: 5, companyName: "Echo", interestLevel: "Medium", status: "Applied" },
  ];

  it("returns all prospects when filter is 'All'", () => {
    const result = filterProspectsByInterest(prospects, "All");
    expect(result).toHaveLength(5);
    expect(result).toEqual(prospects);
  });

  it("returns all prospects when filter is empty string", () => {
    const result = filterProspectsByInterest(prospects, "");
    expect(result).toHaveLength(5);
  });

  it("filters by 'High' interest level", () => {
    const result = filterProspectsByInterest(prospects, "High");
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.interestLevel === "High")).toBe(true);
    expect(result.map((p) => p.companyName)).toEqual(["Acme", "Delta"]);
  });

  it("filters by 'Medium' interest level", () => {
    const result = filterProspectsByInterest(prospects, "Medium");
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.interestLevel === "Medium")).toBe(true);
  });

  it("filters by 'Low' interest level", () => {
    const result = filterProspectsByInterest(prospects, "Low");
    expect(result).toHaveLength(1);
    expect(result[0].companyName).toBe("Gamma");
  });

  it("returns all prospects for an invalid filter value", () => {
    const result = filterProspectsByInterest(prospects, "Invalid");
    expect(result).toHaveLength(5);
  });

  it("returns empty array when no prospects match the filter", () => {
    const noLow = [
      { id: 1, companyName: "A", interestLevel: "High", status: "Bookmarked" },
      { id: 2, companyName: "B", interestLevel: "High", status: "Applied" },
    ];
    const result = filterProspectsByInterest(noLow, "Low");
    expect(result).toHaveLength(0);
  });

  it("works with an empty prospects array", () => {
    const result = filterProspectsByInterest([], "High");
    expect(result).toHaveLength(0);
  });

  it("supports independent per-column filtering", () => {
    const bookmarked = prospects.filter((p) => p.status === "Bookmarked");
    const applied = prospects.filter((p) => p.status === "Applied");

    const bookmarkedHigh = filterProspectsByInterest(bookmarked, "High");
    const appliedMedium = filterProspectsByInterest(applied, "Medium");

    expect(bookmarkedHigh).toHaveLength(1);
    expect(bookmarkedHigh[0].companyName).toBe("Acme");

    expect(appliedMedium).toHaveLength(1);
    expect(appliedMedium[0].companyName).toBe("Echo");
  });
});

describe("getOrderedStatusOptions", () => {
  it("returns statuses starting from the next one for Phone Screen", () => {
    const result = getOrderedStatusOptions("Phone Screen");
    expect(result).toEqual(["Interviewing", "Offer", "Rejected", "Withdrawn", "Bookmarked", "Applied"]);
  });

  it("returns statuses starting from Applied for Bookmarked (first status)", () => {
    const result = getOrderedStatusOptions("Bookmarked");
    expect(result).toEqual(["Applied", "Phone Screen", "Interviewing", "Offer", "Rejected", "Withdrawn"]);
  });

  it("wraps around for Withdrawn (last status)", () => {
    const result = getOrderedStatusOptions("Withdrawn");
    expect(result).toEqual(["Bookmarked", "Applied", "Phone Screen", "Interviewing", "Offer", "Rejected"]);
  });

  it("excludes the current status from the result", () => {
    const statuses = ["Bookmarked", "Applied", "Phone Screen", "Interviewing", "Offer", "Rejected", "Withdrawn"];
    for (const status of statuses) {
      const result = getOrderedStatusOptions(status);
      expect(result).not.toContain(status);
    }
  });

  it("always returns exactly 6 options (total statuses minus 1)", () => {
    const statuses = ["Bookmarked", "Applied", "Phone Screen", "Interviewing", "Offer", "Rejected", "Withdrawn"];
    for (const status of statuses) {
      expect(getOrderedStatusOptions(status)).toHaveLength(6);
    }
  });

  it("returns all statuses for an unknown status", () => {
    const result = getOrderedStatusOptions("Unknown");
    expect(result).toHaveLength(7);
  });

  it("shows correct ordering for Offer", () => {
    const result = getOrderedStatusOptions("Offer");
    expect(result).toEqual(["Rejected", "Withdrawn", "Bookmarked", "Applied", "Phone Screen", "Interviewing"]);
  });
});

describe("shouldCelebrate", () => {
  it("returns true when moving to Offer from a non-Offer status", () => {
    expect(shouldCelebrate("Bookmarked", "Offer")).toBe(true);
    expect(shouldCelebrate("Applied", "Offer")).toBe(true);
    expect(shouldCelebrate("Phone Screen", "Offer")).toBe(true);
    expect(shouldCelebrate("Interviewing", "Offer")).toBe(true);
  });

  it("returns false when status is already Offer", () => {
    expect(shouldCelebrate("Offer", "Offer")).toBe(false);
  });

  it("returns false when moving to any non-Offer status", () => {
    expect(shouldCelebrate("Bookmarked", "Applied")).toBe(false);
    expect(shouldCelebrate("Offer", "Rejected")).toBe(false);
    expect(shouldCelebrate("Interviewing", "Withdrawn")).toBe(false);
  });
});
