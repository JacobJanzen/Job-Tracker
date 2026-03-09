import { filterProspectsByInterest, getNextStatus, validateProspect, isTerminalStatus } from "./prospect-helpers";

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
