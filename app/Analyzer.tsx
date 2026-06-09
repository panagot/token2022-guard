"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { analyze, highSeverityCount } from "@/lib/analyzer";
import { CHECKS } from "@/lib/checks";
import { SAMPLES, type Sample } from "@/lib/samples";
import type { Severity } from "@/lib/types";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

function AnalyzerInner({ extraSamples = [] }: { extraSamples?: Sample[] }) {
  const allSamples = useMemo(() => [...SAMPLES, ...extraSamples], [extraSamples]);
  const sampleById = useMemo(
    () => Object.fromEntries(allSamples.map((s) => [s.id, s])),
    [allSamples],
  );

  const searchParams = useSearchParams();
  const sampleParam = searchParams.get("sample");
  const initialSample =
    sampleParam && sampleById[sampleParam] ? sampleParam : "vulnerable";

  const [activeSample, setActiveSample] = useState(initialSample);
  const [source, setSource] = useState(sampleById[initialSample].source);

  useEffect(() => {
    if (sampleParam && sampleById[sampleParam]) {
      setActiveSample(sampleParam);
      setSource(sampleById[sampleParam].source);
    }
  }, [sampleParam, sampleById]);

  const result = useMemo(() => analyze(source), [source]);
  const highCrit = highSeverityCount(result);

  function loadSample(id: string) {
    setActiveSample(id);
    setSource(sampleById[id].source);
  }

  function onEdit(value: string) {
    setSource(value);
    setActiveSample("");
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="label text-[var(--accent)]">Solana Token-2022 · pre-mainnet safety</p>
        <h1 className="display text-4xl sm:text-5xl">
          Catch Token-2022 footguns
          <br />
          before mainnet.
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)]">
          Paste an Anchor / Rust program (or load a sample). Token2022 Guard runs {CHECKS.length}{" "}
          checks for the extension bugs auditors keep finding: transfer-hook guards, re-entrancy,
          unvalidated extra accounts, fee math, permanent delegates, confidential balances, and
          account sizing.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {allSamples.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => loadSample(s.id)}
              className={`btn btn-ghost text-[10px] ${activeSample === s.id ? "active" : ""}`}
            >
              {s.label}
              <span className="text-[var(--ink-faint)]">· {s.tag}</span>
            </button>
          ))}
          <button type="button" onClick={() => onEdit("")} className="btn btn-ghost text-[10px]">
            Clear
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="label">Program source</h2>
            <span className="text-xs text-[var(--ink-faint)]">{result.linesScanned} lines</span>
          </div>
          <textarea
            className="code-area"
            spellCheck={false}
            value={source}
            onChange={(e) => onEdit(e.target.value)}
            placeholder="// Paste your Anchor / Rust Token-2022 program here…"
            aria-label="Program source"
          />
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="label">Findings</h2>
            <span className={`badge ${highCrit > 0 ? "sev-critical" : "badge-pass"}`}>
              {highCrit > 0 ? `${highCrit} high/critical` : "0 high/critical"}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {SEVERITIES.map((sev) => (
              <div
                key={sev}
                className={`stat-block sev-${sev} px-3 py-3 ${result.counts[sev] > 0 ? "has-findings" : ""}`}
              >
                <div className="stat-value">{result.counts[sev]}</div>
                <div className="label mt-1">{sev}</div>
              </div>
            ))}
          </div>

          {result.findings.length === 0 ? (
            <div className="panel">
              <div className="panel-inner text-sm text-[var(--ink-muted)]">
                No issues detected by the current checks.{" "}
                {source.trim().length === 0
                  ? "Paste a program or load a sample to begin."
                  : "Looks clean — still get a professional audit before mainnet."}
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {result.findings.map((f, i) => (
                <li key={`${f.checkId}-${i}`} className={`panel sev-${f.severity}`}>
                  <div className="panel-inner space-y-3">
                    <div className="severity-rail space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`badge sev-${f.severity}`}>{f.severity}</span>
                        <span className="font-mono text-xs text-[var(--accent)]">{f.checkId}</span>
                        <span className="badge-conf">conf: {f.confidence}</span>
                        {f.line > 0 && (
                          <span className="text-xs text-[var(--ink-faint)]">line {f.line}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold">{f.title}</h3>
                      <p className="text-xs leading-relaxed text-[var(--ink-muted)]">{f.message}</p>
                      {f.evidence && (
                        <pre className="code-block px-3 py-2">{f.evidence}</pre>
                      )}
                      <p className="text-xs leading-relaxed">
                        <span className="label">Fix</span>{" "}
                        <span className="text-[var(--ink)]">{f.remediation}</span>
                      </p>
                      <a
                        href={f.reference}
                        target="_blank"
                        rel="noreferrer"
                        className="nav-link"
                      >
                        Reference →
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-inner flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label">All {CHECKS.length} checks</p>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">
              Full catalog with severity, summaries, and spec links.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/use-cases" className="btn btn-ghost text-[10px]">
              Use cases
            </Link>
            <Link href="/checks" className="btn btn-ghost text-[10px]">
              Check catalog →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Analyzer({ extraSamples }: { extraSamples?: Sample[] }) {
  return (
    <Suspense fallback={<div className="panel animate-pulse"><div className="panel-inner h-64" /></div>}>
      <AnalyzerInner extraSamples={extraSamples} />
    </Suspense>
  );
}
