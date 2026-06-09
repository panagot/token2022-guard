#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const targets = ["./examples", "./benchmark/external"];

const results = [];
for (const dir of targets) {
  const full = join(ROOT, dir);
  let files = [];
  try {
    files = readdirSync(full).filter((f) => f.endsWith(".rs"));
  } catch {
    continue;
  }
  for (const file of files) {
    const path = join(dir, file).replace(/\\/g, "/");
    const out = execSync(`npx tsx cli/index.ts "${path}" --json`, {
      cwd: ROOT,
      encoding: "utf8",
    });
    const json = JSON.parse(out);
    results.push({
      path,
      total: json.total,
      summary: json.summary,
      checks: [
        ...new Set(json.files.flatMap((f) => f.findings.map((x) => x.checkId))),
      ].sort(),
    });
  }
}

const report = { generated: new Date().toISOString(), results };
writeFileSync(join(ROOT, "benchmark", "results.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
