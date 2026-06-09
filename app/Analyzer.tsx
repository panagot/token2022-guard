"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, Suspense, useEffect, useMemo, useState } from "react";

import { SectionHead } from "@/components/SectionHead";
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
  const initialSample = sampleParam && sampleById[sampleParam] ? sampleParam : "vulnerable";

  const [activeSample, setActiveSample] = useState(initialSample);
  const [source, setSource] = useState(sampleById[initialSample].source);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (sampleParam && sampleById[sampleParam]) {
      setActiveSample(sampleParam);
      setSource(sampleById[sampleParam].source);
      setExpanded(new Set());
    }
  }, [sampleParam, sampleById]);

  const result = useMemo(() => analyze(source), [source]);
  const highCrit = highSeverityCount(result);

  function loadSample(id: string) {
    setActiveSample(id);
    setSource(sampleById[id].source);
    setExpanded(new Set());
  }

  function onEdit(value: string) {
    setSource(value);
    setActiveSample("");
    setExpanded(new Set());
  }

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="space-y-14">
      {/* Masthead */}
      <section className="max-w-3xl">
        <p className="eyebrow mb-4">Solana Token-2022 · pre-mainnet review</p>
        <h1 className="display text-[2rem] leading-[1.08] sm:text-[2.6rem] md:text-[3.4rem] md:leading-[1.05]">
          A safety review for Token-2022, before mainnet.
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--ink-muted)] sm:text-[16px]">
          Paste an Anchor or Rust program and Token2022 Guard runs {CHECKS.length} static checks for
          the extension footguns auditors keep finding: transfer-hook guards, re-entrancy,
          unvalidated extra accounts, fee math, permanent delegates, and account sizing.
        </p>
      </section>

      {/* Specimens / sample loader */}
      <section className="space-y-3">
        <SectionHead index="01" label="Load a specimen" />
        <div className="flex flex-wrap items-center gap-2">
          {allSamples.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => loadSample(s.id)}
              className={`btn btn-ghost ${activeSample === s.id ? "active" : ""}`}
            >
              {s.label}
              <span className="mono text-[11px] text-[var(--ink-faint)]">· {s.tag}</span>
            </button>
          ))}
          <button type="button" onClick={() => onEdit("")} className="btn btn-ghost">
            Clear
          </button>
        </div>
      </section>

      {/* Source + results */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <section className="space-y-3">
          <SectionHead
            index="02"
            label="Program source"
            action={
              <span className="mono text-xs text-[var(--ink-faint)]">
                {result.linesScanned} lines
              </span>
            }
          />
          <textarea
            className="code-area"
            spellCheck={false}
            value={source}
            onChange={(e) => onEdit(e.target.value)}
            placeholder="// Paste your Anchor / Rust Token-2022 program here…"
            aria-label="Program source"
          />
        </section>

        <section className="space-y-3">
          <SectionHead
            index="03"
            label="Findings"
            action={
              <span className={`badge ${highCrit > 0 ? "sev-critical" : "badge-pass"}`}>
                <span className="dot" />
                {highCrit > 0 ? `${highCrit} high / critical` : "0 high / critical"}
              </span>
            }
          />

          <div className="sev-strip">
            {SEVERITIES.map((sev) => (
              <span
                key={sev}
                className={`sev-pill sev-${sev} ${result.counts[sev] === 0 ? "is-zero" : ""}`}
              >
                <span className="dot" />
                <span className="sev-pill__count">{result.counts[sev]}</span>
                <span className="capitalize text-[var(--ink-faint)]">{sev}</span>
              </span>
            ))}
          </div>

          {result.findings.length === 0 ? (
            <div className="card px-4 py-5 text-sm text-[var(--ink-muted)]">
              No issues detected by the current checks.{" "}
              {source.trim().length === 0
                ? "Load a specimen or paste a program to begin."
                : "Looks clean — still commission a professional audit before mainnet."}
            </div>
          ) : (
            <div className="ledger">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th style={{ width: "1.4rem" }} aria-label="Severity" />
                    <th style={{ width: "5.2rem" }}>Check</th>
                    <th>Finding</th>
                    <th style={{ width: "3.4rem", textAlign: "right" }}>Line</th>
                  </tr>
                </thead>
                <tbody>
                  {result.findings.map((f, i) => {
                    const open = expanded.has(i);
                    return (
                      <Fragment key={`${f.checkId}-${i}`}>
                        <tr
                          className={`ledger-row sev-${f.severity}`}
                          onClick={() => toggle(i)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggle(i);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-expanded={open}
                        >
                          <td>
                            <span className="dot" title={f.severity} />
                          </td>
                          <td className="cell-id">{f.checkId}</td>
                          <td className="font-medium text-[var(--ink)]">
                            {f.title}
                            <span className="ml-2 mono text-[11px] text-[var(--ink-faint)]">
                              {open ? "−" : "+"}
                            </span>
                          </td>
                          <td className="cell-line">{f.line > 0 ? f.line : "—"}</td>
                        </tr>
                        {open && (
                          <tr className="ledger-detail">
                            <td colSpan={4}>
                              <div className="space-y-2.5 pt-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`badge sev-${f.severity}`}>
                                    <span className="dot" />
                                    {f.severity}
                                  </span>
                                  <span className="badge-soft mono">conf: {f.confidence}</span>
                                </div>
                                <p className="text-[14px] leading-relaxed text-[var(--ink-muted)]">
                                  {f.message}
                                </p>
                                {f.evidence && (
                                  <pre className="code-block px-3 py-2">{f.evidence}</pre>
                                )}
                                <div className="fix-inset">
                                  <span className="fix-inset__label">Fix</span>
                                  {f.remediation}
                                </div>
                                <a
                                  href={f.reference}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="nav-link-inline mono text-xs"
                                >
                                  Specification ↗
                                </a>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Footer nav */}
      <section className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-7">
        <p className="max-w-md text-sm text-[var(--ink-muted)]">
          The full catalog documents every check with a fix and a link to the official Token-2022
          specification.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/use-cases" className="btn btn-ghost">
            Use cases
          </Link>
          <Link href="/checks" className="btn btn-ghost">
            Check catalog ↗
          </Link>
        </div>
      </section>
    </div>
  );
}

export function Analyzer({ extraSamples }: { extraSamples?: Sample[] }) {
  return (
    <Suspense
      fallback={
        <div className="h-72 animate-pulse rounded-[var(--radius)] border border-[var(--line)] bg-[var(--card)]" />
      }
    >
      <AnalyzerInner extraSamples={extraSamples} />
    </Suspense>
  );
}
