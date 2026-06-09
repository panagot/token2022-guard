import { CHECKS, detectTransferHook, runChecks } from "./checks";
import type { AnalysisContext, AnalysisResult, Finding, Severity } from "./types";

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function analyze(source: string): AnalysisResult {
  const lines = source.split(/\r?\n/);
  const ctx: AnalysisContext = {
    source,
    lines,
    isTransferHook: detectTransferHook(source),
  };

  const findings = runChecks(ctx).sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.line - b.line,
  );

  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) counts[f.severity]++;

  const firedIds = new Set(findings.map((f) => f.checkId));
  const passed = CHECKS.filter((c) => !firedIds.has(c.id)).map((c) => c.id);

  return {
    findings,
    counts,
    total: findings.length,
    passed,
    linesScanned: lines.length,
  };
}

export function highSeverityCount(result: AnalysisResult): number {
  return result.counts.critical + result.counts.high;
}

export type { Finding, AnalysisResult };
