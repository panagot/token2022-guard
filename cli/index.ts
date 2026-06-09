#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import process from "node:process";

import { analyze } from "../lib/analyzer";
import { toSarif, type FileFindings } from "../lib/sarif";
import { toMarkdown } from "../lib/markdown";
import type { Severity } from "../lib/types";

const VERSION = "0.1.0";
type Format = "table" | "json" | "sarif" | "markdown";

const SEVERITY_RANK: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };

const COLOR = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  orange: "\x1b[38;5;208m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
};

const SEV_COLOR: Record<Severity, string> = {
  critical: COLOR.red,
  high: COLOR.orange,
  medium: COLOR.yellow,
  low: COLOR.blue,
};

interface Options {
  target: string;
  format: Format;
  failOn: Severity | null;
  noColor: boolean;
  only: Set<string> | null;
  except: Set<string>;
}

function parseList(arg: string): string[] {
  return arg
    .split("=")[1]
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

function parseArgs(argv: string[]): Options {
  const opts: Options = {
    target: ".",
    format: "table",
    failOn: null,
    noColor: false,
    only: null,
    except: new Set(),
  };
  for (const arg of argv) {
    if (arg === "--json") opts.format = "json";
    else if (arg === "--sarif") opts.format = "sarif";
    else if (arg === "--markdown" || arg === "--md") opts.format = "markdown";
    else if (arg === "--no-color") opts.noColor = true;
    else if (arg === "-v" || arg === "--version") {
      console.log(`token2022-guard ${VERSION}`);
      process.exit(0);
    } else if (arg === "-h" || arg === "--help") {
      printHelp();
      process.exit(0);
    } else if (arg.startsWith("--format=")) {
      const v = arg.split("=")[1] as Format;
      if (!["table", "json", "sarif", "markdown"].includes(v)) {
        console.error(`Invalid --format value: ${v} (use table|json|sarif|markdown)`);
        process.exit(2);
      }
      opts.format = v;
    } else if (arg.startsWith("--fail-on=")) {
      const v = arg.split("=")[1] as Severity;
      if (!(v in SEVERITY_RANK)) {
        console.error(`Invalid --fail-on value: ${v} (use critical|high|medium|low)`);
        process.exit(2);
      }
      opts.failOn = v;
    } else if (arg.startsWith("--only=")) {
      opts.only = new Set(parseList(arg));
    } else if (arg.startsWith("--except=")) {
      opts.except = new Set(parseList(arg));
    } else if (!arg.startsWith("-")) {
      opts.target = arg;
    }
  }
  return opts;
}

function printHelp() {
  console.log(`
Token2022 Guard — Token-2022 integration safety checker

Usage:
  t22-guard <path> [options]

Arguments:
  <path>              File or directory to scan (default: ".")

Options:
  --format=<fmt>     Output format: table (default) | json | sarif | markdown
  --json             Alias for --format=json
  --sarif            Alias for --format=sarif (GitHub code scanning)
  --markdown, --md   Alias for --format=markdown (PR comment)
  --fail-on=<sev>    Exit 1 if any finding >= severity (critical|high|medium|low)
  --only=<ids>       Run only these checks (e.g. --only=T22-001,T22-002)
  --except=<ids>     Skip these checks (e.g. --except=T22-007)
  --no-color         Disable ANSI colors
  -v, --version      Print version
  -h, --help         Show this help

Examples:
  t22-guard ./programs
  t22-guard ./programs --fail-on=high
  t22-guard ./programs --sarif > t22.sarif
  t22-guard ./programs --md > t22-report.md
  t22-guard ./programs --only=T22-001,T22-002
`);
}

function collectRustFiles(target: string): string[] {
  const stat = statSync(target);
  if (stat.isFile()) return target.endsWith(".rs") ? [target] : [];
  const out: string[] = [];
  const skip = new Set(["node_modules", "target", ".git", ".next", "dist"]);
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!skip.has(entry.name)) walk(join(dir, entry.name));
      } else if (entry.name.endsWith(".rs")) {
        out.push(join(dir, entry.name));
      }
    }
  };
  walk(target);
  return out;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const c = opts.noColor
    ? new Proxy({}, { get: () => "" })
    : COLOR;

  let files: string[];
  try {
    files = collectRustFiles(opts.target);
  } catch {
    console.error(`Path not found: ${opts.target}`);
    process.exit(2);
  }

  const keep = (id: string) =>
    (!opts.only || opts.only.has(id)) && !opts.except.has(id);

  const perFile: FileFindings[] = files.map((file) => ({
    file: relative(process.cwd(), file) || file,
    findings: analyze(readFileSync(file, "utf8")).findings.filter((f) => keep(f.checkId)),
  }));

  const allFindings = perFile.flatMap((f) => f.findings);
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of allFindings) counts[f.severity]++;

  if (opts.format === "sarif") {
    process.stdout.write(JSON.stringify(toSarif(perFile), null, 2) + "\n");
  } else if (opts.format === "json") {
    process.stdout.write(
      JSON.stringify(
        { scanned: files.length, summary: counts, total: allFindings.length, files: perFile },
        null,
        2,
      ) + "\n",
    );
  } else if (opts.format === "markdown") {
    process.stdout.write(toMarkdown(perFile) + "\n");
  } else {
    printReport(perFile, counts, files.length, c as typeof COLOR);
  }

  if (opts.failOn) {
    const threshold = SEVERITY_RANK[opts.failOn];
    const breach = allFindings.some((f) => SEVERITY_RANK[f.severity] >= threshold);
    if (breach) {
      if (opts.format === "table") {
        console.error(`\n${(c as typeof COLOR).red}✗ Failing: findings at or above "${opts.failOn}".${(c as typeof COLOR).reset}`);
      }
      process.exit(1);
    }
  }
}

function printReport(
  perFile: FileFindings[],
  counts: Record<Severity, number>,
  scanned: number,
  c: typeof COLOR,
) {
  console.log(`\n${c.bold}${c.cyan}Token2022 Guard${c.reset} ${c.dim}· Token-2022 safety scan${c.reset}`);
  console.log(`${c.dim}Scanned ${scanned} file(s)${c.reset}\n`);

  const withFindings = perFile.filter((f) => f.findings.length > 0);
  if (withFindings.length === 0) {
    console.log(`${c.green}✓ No issues detected.${c.reset} ${c.dim}(Still get a professional audit before mainnet.)${c.reset}`);
  }

  for (const { file, findings } of withFindings) {
    console.log(`${c.bold}${file}${c.reset}`);
    for (const f of findings) {
      const sc = SEV_COLOR[f.severity];
      const loc = f.line > 0 ? `:${f.line}` : "";
      console.log(
        `  ${sc}${f.severity.toUpperCase().padEnd(8)}${c.reset} ${c.cyan}${f.checkId}${c.reset} ${c.dim}(conf: ${f.confidence})${c.reset} ${file}${loc}`,
      );
      console.log(`    ${f.title}`);
      console.log(`    ${c.dim}${f.message}${c.reset}`);
      if (f.evidence) console.log(`    ${c.dim}> ${f.evidence}${c.reset}`);
      console.log(`    ${c.green}fix:${c.reset} ${f.remediation}`);
      console.log("");
    }
  }

  const total = counts.critical + counts.high + counts.medium + counts.low;
  const highCrit = counts.critical + counts.high;
  const summaryColor = highCrit > 0 ? c.red : total > 0 ? c.yellow : c.green;
  console.log(
    `${summaryColor}${c.bold}Summary:${c.reset} ${SEV_COLOR.critical}${counts.critical} critical${c.reset}, ` +
      `${SEV_COLOR.high}${counts.high} high${c.reset}, ` +
      `${SEV_COLOR.medium}${counts.medium} medium${c.reset}, ` +
      `${SEV_COLOR.low}${counts.low} low${c.reset} ${c.dim}(${total} total)${c.reset}`,
  );
}

main();
