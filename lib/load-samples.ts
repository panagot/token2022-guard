import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Sample } from "@/lib/samples";

export function loadExampleSample(
  id: string,
  label: string,
  tag: string,
  description: string,
  filename: string,
): Sample {
  const source = readFileSync(join(process.cwd(), "examples", filename), "utf8");
  return { id, label, tag, description, source };
}
