import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { analyze, highSeverityCount } from "../analyzer";
import { CHECKS } from "../checks";
import { CHECK_FIXTURES } from "../fixtures";

const ROOT = join(__dirname, "..", "..");
const readExample = (name: string) =>
  readFileSync(join(ROOT, "examples", name), "utf8");

function hasCheck(source: string, id: string): boolean {
  return analyze(source).findings.some((f) => f.checkId === id);
}

describe("integration examples", () => {
  const vulnerable = readExample("vulnerable_hook.rs");
  const secure = readExample("secure_hook.rs");
  const feeMint = readExample("fee_mint_program.rs");

  it("vulnerable_hook triggers critical T22-001", () => {
    expect(hasCheck(vulnerable, "T22-001")).toBe(true);
  });

  it("vulnerable_hook has high/critical findings", () => {
    expect(highSeverityCount(analyze(vulnerable))).toBeGreaterThan(0);
  });

  it("secure_hook has zero high/critical", () => {
    expect(highSeverityCount(analyze(secure))).toBe(0);
  });

  it("secure_hook has zero findings across full catalog", () => {
    expect(analyze(secure).total).toBe(0);
  });

  it("fee_mint_program triggers fee and SPL wiring checks", () => {
    const r = analyze(feeMint);
    const ids = new Set(r.findings.map((f) => f.checkId));
    expect(ids.has("T22-004")).toBe(true);
    expect(ids.has("T22-005")).toBe(true);
    expect(ids.has("T22-006")).toBe(true);
  });
});

describe("per-check fixtures", () => {
  for (const check of CHECKS) {
    const fx = CHECK_FIXTURES[check.id];
    if (!fx) continue;

    it(`${check.id} fires on bad fixture`, () => {
      expect(hasCheck(fx.bad, check.id)).toBe(true);
    });

    it(`${check.id} passes on good fixture`, () => {
      expect(hasCheck(fx.good, check.id)).toBe(false);
    });
  }
});

describe("catalog", () => {
  it("ships 26 checks", () => {
    expect(CHECKS.length).toBe(26);
  });

  it("every check has a fixture pair", () => {
    for (const c of CHECKS) {
      expect(CHECK_FIXTURES[c.id], `missing fixture for ${c.id}`).toBeDefined();
    }
  });
});
