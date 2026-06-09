import type { AnalysisContext, CheckMeta, Confidence, Finding, Severity } from "./types";

const REF_BASE = "https://spl.solana.com/token-2022/extensions";

export const CHECKS: CheckMeta[] = [
  {
    id: "T22-001",
    title: "Transfer hook missing transferring-state guard",
    severity: "critical",
    summary:
      "A transfer hook that does not assert the token account is in the transferring state can be invoked directly, letting an attacker run hook logic outside a real transfer.",
    reference: `${REF_BASE}/transfer-hook`,
  },
  {
    id: "T22-002",
    title: "Transfer hook re-entrancy / acyclicity risk",
    severity: "high",
    summary:
      "Triggering a token transfer (CPI) of the same mint from inside a transfer hook can cause infinite recursion or a griefing freeze.",
    reference: `${REF_BASE}/transfer-hook`,
  },
  {
    id: "T22-003",
    title: "ExtraAccountMetaList seeds not validated",
    severity: "high",
    summary:
      "Extra accounts resolved for a hook must be derived from validated seeds; otherwise an attacker can inject spoofed accounts (e.g. a fake whitelist).",
    reference: `${REF_BASE}/transfer-hook`,
  },
  {
    id: "T22-004",
    title: "Token-2022 mints not supported (SPL Token only)",
    severity: "high",
    summary:
      "Using anchor_spl::token (or a hardcoded SPL Token program id) instead of token_interface rejects or mishandles Token-2022 mints.",
    reference: "https://spl.solana.com/associated-token-account",
  },
  {
    id: "T22-005",
    title: "Deprecated transfer instead of transfer_checked",
    severity: "medium",
    summary:
      "transfer() does not carry decimals/fee context and reverts on fee or hooked mints. transfer_checked / transfer_checked_with_fee is required.",
    reference: `${REF_BASE}/transfer-fee`,
  },
  {
    id: "T22-006",
    title: "Transfer fee not accounted for",
    severity: "medium",
    summary:
      "calculate_fee and calculate_inverse_fee are not inverses; mixing them drifts balances. Use transfer_checked_with_fee with an explicit expected fee.",
    reference: `${REF_BASE}/transfer-fee`,
  },
  {
    id: "T22-007",
    title: "Permanent delegate not checked on incoming mint",
    severity: "medium",
    summary:
      "A mint with a permanent delegate lets a third party move tokens out of any account. Programs accepting external mints should detect and refuse untrusted delegates.",
    reference: `${REF_BASE}/permanent-delegate`,
  },
  {
    id: "T22-008",
    title: "Confidential transfer auditor key not handled",
    severity: "low",
    summary:
      "Confidential balances cannot be read as plaintext, and a non-zero auditor key is a compliance backdoor that must be acknowledged.",
    reference: `${REF_BASE}/confidential-transfer`,
  },
  {
    id: "T22-009",
    title: "Hardcoded account size for Token-2022 account",
    severity: "medium",
    summary:
      "Token-2022 accounts vary in size by extension. Fixed Mint::LEN / space = N causes rent and init failures; size must be computed dynamically.",
    reference: `${REF_BASE}`,
  },
  {
    id: "T22-010",
    title: "CPI Guard not enabled on custodied token account",
    severity: "high",
    summary:
      "Program-controlled vaults should enable the CpiGuard extension so a malicious CPI cannot move or approve tokens out of them.",
    reference: `${REF_BASE}/cpi-guard`,
  },
  {
    id: "T22-011",
    title: "ImmutableOwner not set on custodied token account",
    severity: "medium",
    summary:
      "Without ImmutableOwner, a token account's owner can be reassigned, enabling account-hijacking attacks against vaults.",
    reference: `${REF_BASE}/immutable-owner`,
  },
  {
    id: "T22-012",
    title: "Transfer hook missing Anchor fallback dispatcher",
    severity: "medium",
    summary:
      "Token-2022 calls the hook via an interface discriminator. Without a fallback that routes Execute to the handler, the hook silently fails or is bypassed.",
    reference: `${REF_BASE}/transfer-hook`,
  },
  {
    id: "T22-013",
    title: "MemoTransfer requirement not handled",
    severity: "medium",
    summary:
      "Accounts with RequiredMemoTransfer revert transfers that lack a memo. Programs moving such tokens must attach a memo or the transfer fails.",
    reference: `${REF_BASE}/required-memo`,
  },
  {
    id: "T22-014",
    title: "DefaultAccountState (frozen) not handled",
    severity: "low",
    summary:
      "Mints with DefaultAccountState=frozen create accounts that must be thawed before use. Ignoring this strands user funds.",
    reference: `${REF_BASE}/default-account-state`,
  },
  {
    id: "T22-015",
    title: "Interest-bearing mint amount/UI confusion",
    severity: "low",
    summary:
      "InterestBearing mints accrue value; the raw `amount` is not the UI value. Use amount_to_ui_amount to avoid mispricing.",
    reference: `${REF_BASE}/interest-bearing-tokens`,
  },
  {
    id: "T22-016",
    title: "Mint close authority not checked on deposit",
    severity: "high",
    summary:
      "A mint whose close authority is still set can be closed and re-opened, breaking vault accounting and enabling confusion attacks on deposited assets.",
    reference: `${REF_BASE}/mint-close-authority`,
  },
  {
    id: "T22-017",
    title: "Hook extra accounts lack owner validation",
    severity: "high",
    summary:
      "Transfer hooks that trust extra accounts without verifying owner or PDA derivation allow attackers to inject spoofed whitelist or policy accounts.",
    reference: `${REF_BASE}/transfer-hook`,
  },
  {
    id: "T22-024",
    title: "Hook program upgrade authority not verified",
    severity: "high",
    summary:
      "Pointing a mint at an external hook program without checking upgrade authority lets a third party swap hook logic after users deposit.",
    reference: `${REF_BASE}/transfer-hook`,
  },
];

export const CHECK_BY_ID = Object.fromEntries(CHECKS.map((c) => [c.id, c]));

type Check = (ctx: AnalysisContext) => Finding[];

function meta(id: string) {
  const m = CHECK_BY_ID[id];
  if (!m) throw new Error(`Unknown check ${id}`);
  return m;
}

function finding(
  id: string,
  line: number,
  evidence: string,
  message: string,
  remediation: string,
  confidence: Confidence,
  severityOverride?: Severity,
): Finding {
  const m = meta(id);
  return {
    checkId: id,
    title: m.title,
    severity: severityOverride ?? m.severity,
    confidence,
    line,
    evidence: evidence.trim(),
    message,
    remediation,
    reference: m.reference,
  };
}

/** Find every line index (1-based) where the regex matches. */
function scan(lines: string[], re: RegexExt): Array<{ line: number; text: string }> {
  const out: Array<{ line: number; text: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) out.push({ line: i + 1, text: lines[i] });
  }
  return out;
}

type RegexExt = { test: (s: string) => boolean };

function has(source: string, re: RegExp): boolean {
  return re.test(source);
}

// Comment-stripping keeps detection honest (so commented-out code doesn't trigger).
function isCode(line: string): boolean {
  const t = line.trim();
  return t.length > 0 && !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*");
}

function codeLines(lines: string[]): string[] {
  return lines.map((l) => (isCode(l) ? l : ""));
}

const HOOK_HINTS =
  /ExtraAccountMetaList|spl_transfer_hook_interface|transfer_hook|TransferHook|#\[interface\(spl_transfer_hook_interface::execute\)\]/;

export function detectTransferHook(source: string): boolean {
  return HOOK_HINTS.test(source);
}

/** True when the program custodies/receives external tokens (deposit/vault/escrow/stake). */
function custodiesTokens(source: string): boolean {
  return (
    /\bfn\s+(deposit|stake|escrow|lock|custody)\b|vault|escrow/i.test(source) &&
    /TokenAccount/.test(source)
  );
}

const checks: Check[] = [
  // T22-001 — transferring-state guard
  (ctx) => {
    if (!ctx.isTransferHook) return [];
    const guarded = has(
      ctx.source,
      /assert_is_transferring|is_transferring|transferring\s*[,)]|TransferHookAccount|get_extension::<TransferHookAccount>/,
    );
    if (guarded) return [];
    const anchor = scan(codeLines(ctx.lines), {
      test: (s) => /fn\s+transfer_hook|fn\s+execute|pub\s+fn\s+process/.test(s),
    });
    const line = anchor[0]?.line ?? 0;
    return [
      finding(
        "T22-001",
        line,
        anchor[0]?.text ?? "",
        "This program implements a transfer hook but never verifies the source token account is in the `transferring` state. The hook can be called directly, outside a real transfer.",
        "At the top of the hook, read the TransferHookAccount extension and reject if not transferring, e.g. `assert_is_transferring(&source_account_info)?;` before any logic.",
        line ? "high" : "medium",
      ),
    ];
  },

  // T22-002 — re-entrancy / recursion
  (ctx) => {
    if (!ctx.isTransferHook) return [];
    const cpiTransfers = scan(codeLines(ctx.lines), {
      test: (s) =>
        /(token_interface|token_2022|spl_token_2022|token)::transfer(_checked)?\s*\(|invoke(_signed)?\s*\(\s*&?transfer/.test(
          s,
        ),
    });
    return cpiTransfers.map((m) =>
      finding(
        "T22-002",
        m.line,
        m.text,
        "A token transfer is invoked from inside the transfer hook. If it moves the same mint, Token-2022 will re-enter this hook and can recurse until the transaction is frozen/reverted.",
        "Do not perform same-mint transfers inside a hook. If a CPI is unavoidable, transfer a different mint and prove acyclicity, or move the logic out of the hook path.",
        "medium",
      ),
    );
  },

  // T22-003 — ExtraAccountMetaList seeds validation
  (ctx) => {
    if (!has(ctx.source, /ExtraAccountMetaList|ExtraAccountMeta/)) return [];
    const seedsValidated = has(ctx.source, /Seed::|seeds\s*=|AccountMeta::new.*seeds|init_extra_account_meta_list/);
    if (seedsValidated && has(ctx.source, /Seed::/)) return [];
    const anchor = scan(codeLines(ctx.lines), { test: (s) => /ExtraAccountMeta(List)?/.test(s) });
    const line = anchor[0]?.line ?? 0;
    return [
      finding(
        "T22-003",
        line,
        anchor[0]?.text ?? "",
        "Extra accounts for the hook do not appear to be derived from validated seeds. An attacker can pass spoofed accounts (e.g. a fake whitelist PDA) and bypass hook logic.",
        "Build the ExtraAccountMetaList from `Seed::` derivations (PDAs) and re-derive/verify those seeds inside the hook instead of trusting passed accounts.",
        "low",
      ),
    ];
  },

  // T22-004 — token_interface vs SPL token
  (ctx) => {
    const usesInterface = has(ctx.source, /token_interface|TokenInterface|Token2022|token_2022/);
    const usesSplOnly = has(ctx.source, /use\s+anchor_spl::token::|anchor_spl::token::(Token|Transfer|Mint|TokenAccount)\b/);
    const hardcoded = scan(codeLines(ctx.lines), {
      test: (s) => /spl_token::ID|spl_token::id\s*\(\s*\)|address\s*=\s*spl_token::ID/.test(s),
    });
    const out: Finding[] = [];
    if (usesSplOnly && !usesInterface) {
      const anchor = scan(codeLines(ctx.lines), { test: (s) => /anchor_spl::token\b/.test(s) });
      out.push(
        finding(
          "T22-004",
          anchor[0]?.line ?? 0,
          anchor[0]?.text ?? "",
          "The program is wired to the legacy SPL Token program via `anchor_spl::token`. Token-2022 mints use a different program id and will be rejected or mishandled.",
          "Use `anchor_spl::token_interface` (TokenInterface, InterfaceAccount<'_, Mint/TokenAccount>) so both SPL Token and Token-2022 mints work.",
          "medium",
        ),
      );
    }
    for (const m of hardcoded) {
      out.push(
        finding(
          "T22-004",
          m.line,
          m.text,
          "The SPL Token program id is hardcoded. This silently excludes Token-2022 mints.",
          "Accept the token program via `Interface<'_, TokenInterface>` and validate the mint's owning program instead of hardcoding `spl_token::ID`.",
          "high",
        ),
      );
    }
    return out;
  },

  // T22-005 — deprecated transfer
  (ctx) => {
    const lines = codeLines(ctx.lines);
    const hits = scan(lines, {
      test: (s) =>
        /(token|spl_token|spl_token_2022)::(instruction::)?transfer\s*\(/.test(s) && !/transfer_checked/.test(s),
    });
    return hits.map((m) =>
      finding(
        "T22-005",
        m.line,
        m.text,
        "Deprecated `transfer` is used. It omits decimals and will revert on mints with transfer fees or hooks, and can misreport moved amounts.",
        "Replace with `transfer_checked` (or `transfer_checked_with_fee` for fee mints), passing the mint and decimals.",
        "high",
      ),
    );
  },

  // T22-006 — fee handling
  (ctx) => {
    const out: Finding[] = [];
    const usesCalc = has(ctx.source, /calculate_fee/);
    const usesInverse = has(ctx.source, /calculate_inverse_fee/);
    if (usesCalc && usesInverse) {
      const anchor = scan(codeLines(ctx.lines), { test: (s) => /calculate_(inverse_)?fee/.test(s) });
      out.push(
        finding(
          "T22-006",
          anchor[0]?.line ?? 0,
          anchor[0]?.text ?? "",
          "Both `calculate_fee` and `calculate_inverse_fee` are used. They are not exact inverses (off-by-one rounding), so balances drift across many transfers.",
          "Pick one direction and settle with `transfer_checked_with_fee`, asserting the exact expected fee instead of recomputing inversely.",
          "medium",
        ),
      );
    }
    return out;
  },

  // T22-007 — permanent delegate
  (ctx) => {
    // Only relevant when the program actually custodies/receives external tokens
    // (a deposit/vault/escrow/stake flow), not for every program touching a TokenAccount.
    const checksDelegate = has(ctx.source, /permanent_delegate|PermanentDelegate/);
    if (!custodiesTokens(ctx.source) || checksDelegate) return [];
    return [
      finding(
        "T22-007",
        0,
        "",
        "The program accepts external token accounts but never inspects the mint for a PermanentDelegate extension. A permanent delegate can drain deposited tokens from vaults.",
        "On deposit, read the mint extensions and refuse (or explicitly allowlist) mints whose `PermanentDelegate` is set to an untrusted authority.",
        "low",
      ),
    ];
  },

  // T22-008 — confidential transfer auditor key
  (ctx) => {
    if (!has(ctx.source, /ConfidentialTransfer|confidential_transfer|confidential/i)) return [];
    if (has(ctx.source, /auditor|auditor_elgamal|auditor_pubkey/i)) return [];
    const anchor = scan(codeLines(ctx.lines), { test: (s) => /confidential/i.test(s) });
    return [
      finding(
        "T22-008",
        anchor[0]?.line ?? 0,
        anchor[0]?.text ?? "",
        "Confidential transfers are referenced but the auditor key is never inspected. Plaintext balance reads will be wrong, and a non-zero auditor key is an undisclosed backdoor.",
        "Treat confidential balances as opaque, and assert the auditor ElGamal pubkey is zero (or document/audit it) before trusting the mint.",
        "low",
      ),
    ];
  },

  // T22-009 — hardcoded account size
  (ctx) => {
    if (has(ctx.source, /try_calculate_account_len|ExtensionType::try_calculate|get_account_len/)) return [];
    const lines = codeLines(ctx.lines);
    const hits = scan(lines, {
      test: (s) =>
        /(Mint::LEN|TokenAccount::LEN|spl_token::state::(Mint|Account)::LEN)/.test(s) ||
        /space\s*=\s*\d+\b/.test(s),
    });
    // Only flag space=N when the surrounding source clearly deals with token/mint accounts.
    const tokenContext = has(ctx.source, /Mint|TokenAccount|token/i);
    return hits
      .filter((m) => /LEN/.test(m.text) || tokenContext)
      .map((m) =>
        finding(
          "T22-009",
          m.line,
          m.text,
          "A fixed account size is used for a token/mint account. Token-2022 accounts grow with extensions, so a hardcoded length under-allocates and fails at runtime.",
          "Compute size with `ExtensionType::try_calculate_account_len::<Mint>(&[...])` (or the account-len helper) and fund rent for that exact size.",
          "medium",
        ),
      );
  },

  // T22-010 — CPI Guard on custodied accounts
  (ctx) => {
    if (!custodiesTokens(ctx.source)) return [];
    if (has(ctx.source, /CpiGuard|cpi_guard/)) return [];
    return [
      finding(
        "T22-010",
        0,
        "",
        "The program custodies token accounts (vault/escrow) but never enables the CpiGuard extension. A malicious CPI could transfer or approve tokens out of the vault.",
        "Enable CpiGuard on program-owned token accounts so transfers/approvals/close cannot be driven by an outer CPI.",
        "low",
      ),
    ];
  },

  // T22-011 — ImmutableOwner on custodied accounts
  (ctx) => {
    if (!custodiesTokens(ctx.source)) return [];
    if (has(ctx.source, /ImmutableOwner|immutable_owner/)) return [];
    return [
      finding(
        "T22-011",
        0,
        "",
        "Custodied token accounts do not set ImmutableOwner. The account owner could be reassigned, enabling an account-hijacking attack on the vault.",
        "Create vault token accounts with the ImmutableOwner extension (ATAs have it by default; raw accounts must opt in).",
        "low",
      ),
    ];
  },

  // T22-012 — transfer hook fallback dispatcher
  (ctx) => {
    if (!ctx.isTransferHook) return [];
    if (has(ctx.source, /fn\s+fallback|__global|process_instruction|fallback\s*\(/)) return [];
    const anchor = scan(codeLines(ctx.lines), { test: (s) => /#\[program\]|pub\s+mod/.test(s) });
    return [
      finding(
        "T22-012",
        anchor[0]?.line ?? 0,
        anchor[0]?.text ?? "",
        "This transfer hook program has no Anchor `fallback`. Token-2022 invokes the hook with the interface Execute discriminator, which Anchor will not route without a fallback dispatcher.",
        "Add a `fallback` that detects the Execute discriminator and dispatches to your `transfer_hook` handler (e.g. via Anchor's internal global dispatcher).",
        "medium",
      ),
    ];
  },

  // T22-013 — MemoTransfer requirement
  (ctx) => {
    if (!has(ctx.source, /MemoTransfer|required_memo|RequiredMemo|memo_transfer/i)) return [];
    if (has(ctx.source, /spl_memo|build_memo|add_memo|create_memo|invoke.*memo/i)) return [];
    const anchor = scan(codeLines(ctx.lines), { test: (s) => /memo/i.test(s) });
    return [
      finding(
        "T22-013",
        anchor[0]?.line ?? 0,
        anchor[0]?.text ?? "",
        "A memo-transfer requirement is referenced but no memo instruction is attached. Transfers to memo-required accounts will revert.",
        "Attach an SPL Memo instruction immediately before the transfer when the destination enforces RequiredMemoTransfer.",
        "low",
      ),
    ];
  },

  // T22-014 — DefaultAccountState frozen
  (ctx) => {
    if (!has(ctx.source, /DefaultAccountState|default_account_state/i)) return [];
    if (has(ctx.source, /thaw_account|thaw|unfreeze/i)) return [];
    const anchor = scan(codeLines(ctx.lines), { test: (s) => /DefaultAccountState|default_account_state/i.test(s) });
    return [
      finding(
        "T22-014",
        anchor[0]?.line ?? 0,
        anchor[0]?.text ?? "",
        "The mint uses DefaultAccountState but no thaw path is present. If the default state is frozen, newly created accounts are unusable until thawed.",
        "Thaw accounts after creation (with the freeze authority) or document that holders must be thawed before transfers.",
        "low",
      ),
    ];
  },

  // T22-015 — interest-bearing amount confusion
  (ctx) => {
    if (!has(ctx.source, /InterestBearing|interest_bearing/i)) return [];
    if (has(ctx.source, /amount_to_ui_amount|ui_amount_to_amount|ui_amount/i)) return [];
    const anchor = scan(codeLines(ctx.lines), { test: (s) => /\.amount\b|interest_bearing|InterestBearing/i.test(s) });
    return [
      finding(
        "T22-015",
        anchor[0]?.line ?? 0,
        anchor[0]?.text ?? "",
        "An interest-bearing mint is used but value is read from the raw `amount`. The displayed/effective value differs from the stored amount.",
        "Convert with `amount_to_ui_amount` when presenting or pricing balances of interest-bearing mints.",
        "low",
      ),
    ];
  },

  // T22-016 — mint close authority on deposit
  (ctx) => {
    if (!custodiesTokens(ctx.source)) return [];
    if (has(ctx.source, /close_authority|CloseAuthority|mint.*close|is_none\(\)/i)) return [];
    if (!has(ctx.source, /\bMint\b|mint:/)) return [];
    return [
      finding(
        "T22-016",
        0,
        "",
        "The program accepts deposits against a mint but never checks whether the mint close authority is disabled. A closable mint can break vault assumptions.",
        "Require `mint.close_authority` is None (or an explicitly trusted authority) before accepting deposits.",
        "high",
      ),
    ];
  },

  // T22-017 — hook extra account owner validation
  (ctx) => {
    if (!ctx.isTransferHook) return [];
    const usesExtra = has(ctx.source, /extra_account|whitelist|policy|gate/i);
    const validatesOwner = has(
      ctx.source,
      /require_keys_eq!|\.owner|has_one|owner\s*==|find_program_address|seeds\s*=/,
    );
    if (!usesExtra || validatesOwner) return [];
    const anchor = scan(codeLines(ctx.lines), { test: (s) => /transfer_hook|fn\s+execute/.test(s) });
    return [
      finding(
        "T22-017",
        anchor[0]?.line ?? 0,
        anchor[0]?.text ?? "",
        "The transfer hook reads extra accounts (e.g. whitelist) without validating owner or re-deriving PDAs from seeds.",
        "Re-derive every policy PDA inside the hook and reject accounts whose owner or seeds do not match expectations.",
        "medium",
      ),
    ];
  },

  // T22-024 — hook program upgrade authority
  (ctx) => {
    const setsHook = has(ctx.source, /transfer_hook_program|set_transfer_hook|hook_program_id/i);
    const verifiesUpgrade = has(
      ctx.source,
      /upgrade_authority|UpgradeableLoader|program_data|is_executable|verify.*hook/i,
    );
    if (!setsHook || verifiesUpgrade) return [];
    const anchor = scan(codeLines(ctx.lines), { test: (s) => /transfer_hook|hook_program/.test(s) });
    return [
      finding(
        "T22-024",
        anchor[0]?.line ?? 0,
        anchor[0]?.text ?? "",
        "A transfer hook program id is configured without verifying upgrade authority. The hook logic can be swapped after users integrate.",
        "Before trusting a hook program, verify its upgrade authority is revoked or held by a known multisig you accept.",
        "medium",
      ),
    ];
  },
];

export function runChecks(ctx: AnalysisContext): Finding[] {
  return checks.flatMap((c) => {
    try {
      return c(ctx);
    } catch {
      return [];
    }
  });
}
