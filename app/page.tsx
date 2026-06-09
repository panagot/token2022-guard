import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Sample } from "@/lib/samples";

import { Analyzer } from "./Analyzer";

function extensionsSample(): Sample {
  const source = readFileSync(join(process.cwd(), "examples", "extensions_program.rs"), "utf8");
  return {
    id: "extensions",
    label: "Bad extension wiring",
    tag: "12+ findings",
    description:
      "Pointer extensions without validation, transfer-fee epoch drift, pausable mint transfers, and mint authority used after CPI.",
    source,
  };
}

export default function Home() {
  return <Analyzer extraSamples={[extensionsSample()]} />;
}
