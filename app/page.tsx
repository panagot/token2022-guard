import { Analyzer } from "./Analyzer";
import { loadExampleSample } from "@/lib/load-samples";

export const metadata = {
  title: "Analyzer",
  description:
    "Run 26 Token-2022 safety checks on Anchor/Rust source. Load vulnerable, secure, fee, or extension samples.",
};

export default function Home() {
  const extraSamples = [
    loadExampleSample(
      "extensions",
      "Bad extension wiring",
      "13 findings",
      "Pointer extensions without validation, transfer-fee epoch drift, pausable mint transfers, and mint authority used after CPI.",
      "extensions_program.rs",
    ),
    loadExampleSample(
      "fee_mint",
      "Bad fee mint vault",
      "11 findings",
      "SPL-only wiring, deprecated transfer, mixed fee math, and missing vault hardening on a fee mint deposit.",
      "fee_mint_program.rs",
    ),
  ];

  return <Analyzer extraSamples={extraSamples} />;
}
