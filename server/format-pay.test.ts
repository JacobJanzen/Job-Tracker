import { formatPay } from "@shared/schema";

describe("formatPay", () => {
  it("displays hourly rate for 1-digit values", () => {
    expect(formatPay(5)).toBe("$5 / hr");
  });

  it("displays hourly rate for 2-digit values", () => {
    expect(formatPay(85)).toBe("$85 / hr");
  });

  it("displays hourly rate for 3-digit values", () => {
    expect(formatPay(150)).toBe("$150 / hr");
    expect(formatPay(999)).toBe("$999 / hr");
  });

  it("displays in thousands with k suffix for 4-digit values", () => {
    expect(formatPay(1000)).toBe("$1k");
    expect(formatPay(5500)).toBe("$5.5k");
  });

  it("displays in thousands with k suffix for 5-digit values", () => {
    expect(formatPay(85000)).toBe("$85k");
    expect(formatPay(92500)).toBe("$92.5k");
  });

  it("displays in thousands with k suffix for 6-digit values", () => {
    expect(formatPay(165300)).toBe("$165.3k");
    expect(formatPay(200000)).toBe("$200k");
  });

  it("rounds to one decimal place", () => {
    expect(formatPay(165350)).toBe("$165.4k");
    expect(formatPay(99999)).toBe("$100k");
    expect(formatPay(1250)).toBe("$1.3k");
  });

  it("omits decimal when value is exactly on a thousand boundary", () => {
    expect(formatPay(50000)).toBe("$50k");
    expect(formatPay(120000)).toBe("$120k");
  });

  it("displays in millions with m suffix for 7+ digit values", () => {
    expect(formatPay(1000000)).toBe("$1m");
    expect(formatPay(1700500)).toBe("$1.7m");
    expect(formatPay(10000000)).toBe("$10m");
    expect(formatPay(15500000)).toBe("$15.5m");
  });
});
