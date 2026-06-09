#!/usr/bin/env node
/**
 * Simulates a fresh install: pack → install in temp dir → run CLI.
 * Run before npm publish.
 */
import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = process.cwd();
const tmp = mkdtempSync(join(tmpdir(), "t22-smoke-"));

try {
  const packOut = execSync("npm pack --silent", { cwd: ROOT, encoding: "utf8" }).trim();
  const tgz = join(ROOT, packOut);
  console.log("packed:", packOut);

  execSync("npm init -y", { cwd: tmp, stdio: "ignore" });
  execSync(`npm install "${tgz}"`, { cwd: tmp, stdio: "inherit" });

  const version = execSync("npx token2022-guard --version", {
    cwd: tmp,
    encoding: "utf8",
  }).trim();
  console.log("version:", version);

  const vulnerable = join(ROOT, "examples", "vulnerable_hook.rs");
  const out = execSync(`npx token2022-guard "${vulnerable}" --json`, {
    cwd: tmp,
    encoding: "utf8",
  });
  const json = JSON.parse(out);
  if (json.total < 1) throw new Error("expected findings on vulnerable_hook.rs");
  console.log("scan:", json.total, "findings on vulnerable_hook.rs");

  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  if (!version.includes(pkg.version)) {
    throw new Error(`CLI version mismatch: ${version} vs package ${pkg.version}`);
  }

  console.log("smoke test passed");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
