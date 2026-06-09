import { CHECKS } from "./checks";
import type { Finding, Severity } from "./types";

export interface FileFindings {
  file: string;
  findings: Finding[];
}

const SARIF_LEVEL: Record<Severity, "error" | "warning" | "note"> = {
  critical: "error",
  high: "error",
  medium: "warning",
  low: "note",
};

const SECURITY_SEVERITY: Record<Severity, string> = {
  critical: "9.0",
  high: "7.5",
  medium: "5.0",
  low: "3.0",
};

/** Produce a SARIF 2.1.0 document for GitHub code scanning / CI. */
export function toSarif(results: FileFindings[], version = "0.1.0") {
  const rules = CHECKS.map((c) => ({
    id: c.id,
    name: c.title.replace(/\s+/g, ""),
    shortDescription: { text: c.title },
    fullDescription: { text: c.summary },
    helpUri: c.reference,
    defaultConfiguration: { level: SARIF_LEVEL[c.severity] },
    properties: {
      tags: ["token-2022", "solana", "security"],
      "security-severity": SECURITY_SEVERITY[c.severity],
    },
  }));

  const ruleIndex = new Map(CHECKS.map((c, i) => [c.id, i]));

  const sarifResults = results.flatMap(({ file, findings }) =>
    findings.map((f) => ({
      ruleId: f.checkId,
      ruleIndex: ruleIndex.get(f.checkId) ?? 0,
      level: SARIF_LEVEL[f.severity],
      message: { text: `${f.message} Fix: ${f.remediation}` },
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri: normalizeUri(file) },
            region: { startLine: Math.max(1, f.line) },
          },
        },
      ],
      properties: { confidence: f.confidence, severity: f.severity },
    })),
  );

  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "Token2022 Guard",
            informationUri: "https://github.com/panagot/token2022-guard",
            version,
            rules,
          },
        },
        results: sarifResults,
      },
    ],
  };
}

function normalizeUri(file: string): string {
  return file.replace(/\\/g, "/").replace(/^\.\//, "");
}
