# T22 Guard — VS Code extension

Inline Token-2022 integration safety diagnostics, powered by the same engine as the
T22 Guard CLI and web UI (`../lib`).

Open any `.rs` Anchor program and T22 Guard underlines the Token-2022 footguns it finds —
hover for the issue, the fix, and a spec link.

## Develop / run it

```bash
npm install
npm run build      # bundles src + ../lib into dist/extension.js via esbuild
```

Then press **F5** in VS Code (with this folder open) to launch an Extension Development
Host, and open `../examples/vulnerable_hook.rs` to see the squiggles.

## How it works

`src/extension.ts` subscribes to document open/change/save, runs `analyze()` from the
shared `lib/` engine, and maps each finding to a `vscode.Diagnostic`:

| Finding severity | Editor severity |
|------------------|-----------------|
| critical / high  | Error |
| medium           | Warning |
| low              | Information |

No analysis logic is duplicated — the extension, CLI, and web UI all call the same checks.

## Roadmap

- Quick-fix code actions (insert the remediation snippet)
- Workspace-wide scan command + problems panel summary
- Settings to toggle individual checks
- Marketplace publish
