import * as vscode from "vscode";
import { analyze } from "../../lib/analyzer";
import type { Severity } from "../../lib/types";

const SEVERITY_MAP: Record<Severity, vscode.DiagnosticSeverity> = {
  critical: vscode.DiagnosticSeverity.Error,
  high: vscode.DiagnosticSeverity.Error,
  medium: vscode.DiagnosticSeverity.Warning,
  low: vscode.DiagnosticSeverity.Information,
};

function isEnabled(): boolean {
  return vscode.workspace.getConfiguration("t22guard").get<boolean>("enable", true);
}

export function activate(context: vscode.ExtensionContext) {
  const collection = vscode.languages.createDiagnosticCollection("t22-guard");
  context.subscriptions.push(collection);

  const refresh = (doc: vscode.TextDocument) => {
    if (doc.languageId !== "rust") return;
    if (!isEnabled()) {
      collection.delete(doc.uri);
      return;
    }

    const { findings } = analyze(doc.getText());
    const diagnostics = findings.map((f) => {
      const lineIndex = f.line > 0 ? Math.min(f.line - 1, doc.lineCount - 1) : 0;
      const range = doc.lineAt(lineIndex).range;
      const diagnostic = new vscode.Diagnostic(
        range,
        `${f.title}\n${f.message}\nFix: ${f.remediation}`,
        SEVERITY_MAP[f.severity],
      );
      diagnostic.code = { value: f.checkId, target: vscode.Uri.parse(f.reference) };
      diagnostic.source = "T22 Guard";
      return diagnostic;
    });

    collection.set(doc.uri, diagnostics);
  };

  const refreshActive = () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) refresh(editor.document);
  };

  refreshActive();

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(refresh),
    vscode.workspace.onDidChangeTextDocument((e) => refresh(e.document)),
    vscode.workspace.onDidSaveTextDocument(refresh),
    vscode.window.onDidChangeActiveTextEditor((editor) => editor && refresh(editor.document)),
    vscode.workspace.onDidCloseTextDocument((doc) => collection.delete(doc.uri)),
    vscode.commands.registerCommand("t22guard.scanActiveFile", () => {
      refreshActive();
      vscode.window.showInformationMessage("T22 Guard: scanned active file.");
    }),
  );
}

export function deactivate() {}
