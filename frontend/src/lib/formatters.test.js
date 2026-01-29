import { describe, expect, it } from "vitest";
import { formatNumber, formatCurrencyRounded, getVariableLabel } from "./formatters.js";

describe("formatters", () => {
  it("formats numbers with commas", () => {
    expect(formatNumber(1234567)).toBe("1.23M");
  });

  it("formats rounded currency", () => {
    expect(formatCurrencyRounded(1200)).toBe("$1.2K");
  });

  it("falls back to variable key when label missing", () => {
    expect(getVariableLabel("missing_dataset", "my_var")).toBe("My Var");
  });
});
