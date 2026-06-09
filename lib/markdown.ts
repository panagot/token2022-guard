import type { FileFindings } from "./sarif";
import type { Severity } from "./types";

const SEV_EMOJI: Record<Severity, string> = {
  critical: "🟥",
  high: "🟧",
  medium: "🟨",
  low: "🟦",
};

/** Render findings as a Markdown report (suitable for a PR comment). */
export function toMarkdown(results: FileFindings[]): string {
  const all = results.flatMap((r) => r.findings);
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of all) counts[f.severity]++;

  const lines: string[] = [];
  lines.push("## Token2022 Guard — Token-2022 safety report");
  lines.push("");
  lines.push(
    `**${counts.critical} critical · ${counts.high} high · ${counts.medium} medium · ${counts.low} low** (${all.length} total)`,
  );
  lines.push("");

  if (all.length === 0) {
    lines.push("✅ No issues detected. (Still get a professional audit before mainnet.)");
    return lines.join("\n");
  }

  lines.push("| Sev | Check | Location | Issue |");
  lines.push("| --- | --- | --- | --- |");
  for (const { file, findings } of results) {
    for (const f of findings) {
      const loc = f.line > 0 ? `\`${file}:${f.line}\`` : `\`${file}\``;
      lines.push(
        `| ${SEV_EMOJI[f.severity]} ${f.severity} | [${f.checkId}](${f.reference}) | ${loc} | ${escapePipe(f.title)} |`,
      );
    }
  }
  lines.push("");
  lines.push("<details><summary>Remediation details</summary>");
  lines.push("");
  for (const { file, findings } of results) {
    for (const f of findings) {
      const loc = f.line > 0 ? `${file}:${f.line}` : file;
      lines.push(`- **${f.checkId} ${f.title}** (${loc})`);
      lines.push(`  - ${escapePipe(f.message)}`);
      lines.push(`  - _Fix:_ ${escapePipe(f.remediation)}`);
    }
  }
  lines.push("");
  lines.push("</details>");
  return lines.join("\n");
}

function escapePipe(s: string): string {
  return s.replace(/\|/g, "\\|");
}
