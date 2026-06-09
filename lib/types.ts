export type Severity = "critical" | "high" | "medium" | "low";
export type Confidence = "high" | "medium" | "low";

export interface CheckMeta {
  id: string;
  title: string;
  severity: Severity;
  summary: string;
  reference: string;
}

export interface Finding {
  checkId: string;
  title: string;
  severity: Severity;
  confidence: Confidence;
  /** 1-based line number; 0 means file-level (no single line). */
  line: number;
  /** The offending source line, trimmed. Empty for file-level findings. */
  evidence: string;
  message: string;
  remediation: string;
  reference: string;
}

export interface AnalysisResult {
  findings: Finding[];
  counts: Record<Severity, number>;
  total: number;
  /** Checks that ran and produced no finding — useful to show coverage. */
  passed: string[];
  linesScanned: number;
}

export interface AnalysisContext {
  source: string;
  lines: string[];
  /** True if the source looks like a Token-2022 transfer-hook program. */
  isTransferHook: boolean;
}
