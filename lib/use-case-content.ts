export interface UseCaseDetail {
  problem: string;
  audience: string;
  when: string[];
  workflow: { step: string; detail: string }[];
  whatWeCatch: string[];
  avoid: string[];
  relatedGuides: { slug: string; title: string }[];
}

export const USE_CASE_CONTENT: Record<string, UseCaseDetail> = {
  "transfer-hook": {
    problem:
      "A transfer hook runs inside every transfer of a hooked mint, and Token-2022 invokes it through the interface Execute discriminator rather than your Anchor handler. Three footguns follow. If you never read the source account's transferring flag, anyone can call the hook directly and run your policy logic on accounts they choose. If you transfer the same mint from inside the hook, Token-2022 re-enters it and recurses until the transaction dies. And if you trust the extra accounts passed to the hook instead of re-deriving them from seeds, an attacker can swap in a look-alike whitelist or policy account.",
    audience: "Teams shipping a custom Token-2022 transfer hook in Anchor or native Rust.",
    when: [
      "You are writing the transfer_hook or Execute handler for the first time.",
      "You added a whitelist, policy gate, or fee logic that reads extra accounts.",
      "You are about to point a production mint at your hook program id.",
      "An audit flagged hook invocation or ExtraAccountMetaList handling.",
    ],
    workflow: [
      {
        step: "Load the vulnerable sample",
        detail:
          "Open the analyzer with the vulnerable sample and read the four hook findings: T22-001 (critical), T22-002, T22-003, and T22-012. They map to the footguns auditors report most often.",
      },
      {
        step: "Scan your hook crate",
        detail:
          "Run the scan against your hook package with a high fail threshold, or paste the source into the web UI. Clear high and critical before touching anything else.",
      },
      {
        step: "Compare against the secure sample",
        detail:
          "Toggle the secure sample, which reports zero high or critical findings. Use it as a structural reference: assert_is_transferring, a seed-derived whitelist PDA, token_interface accounts, and a fallback dispatcher.",
      },
      {
        step: "Re-scan after fixes",
        detail:
          "Clear high and critical before mainnet, then keep the medium findings on a checklist for audit. Static analysis will not catch every runtime edge case in your policy logic.",
      },
    ],
    whatWeCatch: [
      "T22-001: hook callable outside a real transfer (no transferring-state guard).",
      "T22-002: same-mint CPI transfer inside the hook, a recursion and griefing risk.",
      "T22-003: ExtraAccountMetaList built without Seed derivations.",
      "T22-012: missing Anchor fallback for the Execute discriminator.",
      "T22-017: extra accounts (whitelist or policy) read without owner or PDA checks.",
      "T22-024: hook program id trusted without verifying upgrade authority.",
    ],
    avoid: [
      "Trusting an extra account because it is present in the account list; always re-derive its PDA and compare keys.",
      "Shipping without a fallback when you use Anchor's program macro; the hook is silently bypassed.",
      "Assuming the hook only runs during user transfers; without the transferring guard it can be invoked directly.",
      "Calling transfer_checked on the same mint inside the hook to move a fee or reward; it re-enters and recurses.",
    ],
    relatedGuides: [
      { slug: "transfer-hook-checklist", title: "Transfer Hook Security Checklist" },
      { slug: "token2022-not-spl", title: "Token-2022 Is Not SPL Token" },
    ],
  },
  "hook-review": {
    problem:
      "When you list or route transfers through a mint whose hook program you did not write, you inherit that hook's risk. A hook that lacks a transferring-state guard, performs same-mint CPI, trusts extra accounts, or remains upgradeable can be turned against your users after you integrate. Reviewing it before you commit is cheaper than discovering the issue when funds are already routed through it.",
    audience: "Integrators, listing teams, and reviewers assessing an external hook program.",
    when: [
      "A partner mint uses a transfer hook program you do not control.",
      "You are adding hooked mints to a DEX, vault, or payment rail.",
      "You are doing due diligence before listing a token with custom hook logic.",
    ],
    workflow: [
      {
        step: "Obtain the hook source",
        detail:
          "Request the verified program source or the IDL. Scan the whole crate; hook programs are small but dense, and the risk is usually in account handling rather than line count.",
      },
      {
        step: "Run a focused pass",
        detail:
          "Filter to the four review-critical checks with --only=T22-001,T22-002,T22-017,T22-024 for a fast read on direct invocation, re-entrancy, extra-account trust, and upgrade authority.",
      },
      {
        step: "Diff against the secure baseline",
        detail:
          "Compare structurally with the secure sample: a transferring assertion, no in-hook transfer, seed-validated accounts, and a revoked or multisig upgrade authority.",
      },
      {
        step: "Document residual risk",
        detail:
          "A static scan is not an audit. Record which findings you accept and which are blockers for listing, with the rationale for each.",
      },
    ],
    whatWeCatch: [
      "T22-001: the hook can be invoked directly, outside a transfer.",
      "T22-002: in-hook same-mint transfer enabling recursion or griefing.",
      "T22-017: spoofable whitelist or policy accounts.",
      "T22-024: upgradeable hook logic that can change after you integrate.",
    ],
    avoid: [
      "Listing a mint because the hook looks simple; the risk hides in how it resolves extra accounts.",
      "Skipping review because the hook is battle tested elsewhere; Solana's invocation and re-entrancy model is specific.",
      "Trusting a hook whose upgrade authority is a single hot key.",
    ],
    relatedGuides: [
      { slug: "transfer-hook-checklist", title: "Transfer Hook Security Checklist" },
      { slug: "pre-audit-prep", title: "Pre-Audit Prep Workflow" },
    ],
  },
  "spl-migration": {
    problem:
      "Code written for SPL Token tends to hardcode anchor_spl::token, the SPL Token program id, a fixed space of 165 bytes, and a bare transfer without decimals. Token-2022 mints are owned by a different program, vary in size by extension, and can carry fees, hooks, freeze state, and a NonTransferable flag. Each legacy pattern either rejects Token-2022 mints outright or fails dangerously at runtime when a real extension is present.",
    audience: "Teams upgrading an existing Anchor program to support Token-2022 mints.",
    when: [
      "Product asked for Token-2022 support on a program that only handled SPL Token.",
      "You added spl_token_2022 imports but kept legacy token::transfer calls.",
      "Init paths still use Mint::LEN or a fixed space without extension sizing.",
    ],
    workflow: [
      {
        step: "Scan the full programs tree",
        detail:
          "Run a scan across all programs and sort by severity. The SPL wiring and deprecated transfer findings (T22-004 and T22-005) are the first migration blockers to clear.",
      },
      {
        step: "Replace the token wiring",
        detail:
          "Move to anchor_spl::token_interface with InterfaceAccount and Interface<'_, TokenInterface>, and switch transfers to transfer_checked. The migration guide has the concrete diff.",
      },
      {
        step: "Fix account sizing",
        detail:
          "Replace hardcoded lengths with ExtensionType::try_calculate_account_len for the exact extension set of each mint, and fund rent for that computed size.",
      },
      {
        step: "Re-test on devnet with a real Token-2022 mint",
        detail:
          "Static fixes clear many findings; a devnet mint with fees and a hook enabled confirms your init and transfer paths actually work end to end.",
      },
    ],
    whatWeCatch: [
      "T22-004: SPL-Token-only wiring or a hardcoded SPL Token program id.",
      "T22-005: deprecated transfer instead of transfer_checked.",
      "T22-009: fixed account size for a token or mint account.",
      "T22-022: transfers that never check for the NonTransferable extension.",
      "T22-026: transfers that ignore frozen AccountState.",
    ],
    avoid: [
      "Feature-flagging Token-2022 while keeping the SPL token type; both mint kinds need the interface types.",
      "Reusing SPL init macros for extension-bearing mints, which under-allocates the account.",
      "Passing a hardcoded decimals constant to transfer_checked instead of reading mint.decimals.",
    ],
    relatedGuides: [
      { slug: "token2022-not-spl", title: "Token-2022 Is Not SPL Token" },
      { slug: "cli-quickstart", title: "CLI Quickstart" },
    ],
  },
  "vault-deposit": {
    problem:
      "Vaults, escrows, and staking programs custody user tokens, which means they own token accounts and accept mints they did not create. Token-2022 breaks the assumption that deposited funds stay put: a permanent delegate can move tokens from any account on the mint, a still-set close authority can invalidate accounting, an outer CPI can drive a transfer out of an unguarded vault account, and an account owner can be reassigned if ImmutableOwner is not set.",
    audience: "DeFi vault, escrow, staking, and payment-hold programs accepting external mints.",
    when: [
      "You accept arbitrary Token-2022 mints as collateral or deposits.",
      "You create program-owned token accounts such as vault PDAs.",
      "Users can deposit without your program having created the mint.",
    ],
    workflow: [
      {
        step: "Scan deposit and withdraw paths",
        detail:
          "Focus the review on the deposit, stake, lock, and escrow handlers and the account structs behind them, since that is where custody is established.",
      },
      {
        step: "Screen incoming mint extensions",
        detail:
          "On the way in, read the mint and apply a policy: permanent delegate (T22-007), close authority (T22-016), NonTransferable (T22-022), and Pausable (T22-023). Refuse or allowlist as appropriate.",
      },
      {
        step: "Harden the vault token accounts",
        detail:
          "Enable CpiGuard (T22-010) and ImmutableOwner (T22-011) on the accounts your program owns, so an outer CPI cannot drain them and their owner cannot be reassigned.",
      },
      {
        step: "Use checked transfers and read account state",
        detail:
          "Replace bare transfer with transfer_checked, and read AccountState (T22-026) before moving tokens so a frozen account fails in tests rather than on a user withdrawal.",
      },
    ],
    whatWeCatch: [
      "T22-007: permanent delegate on the mint not inspected before custody.",
      "T22-010: CpiGuard missing on program-owned vault accounts.",
      "T22-011: ImmutableOwner not set on custodied accounts.",
      "T22-016: mint close authority not required to be disabled.",
      "T22-005: deprecated transfer on the deposit or withdraw path.",
      "T22-026: frozen account state ignored before transfer.",
    ],
    avoid: [
      "Assuming ATA defaults cover you; raw accounts your program creates need explicit ImmutableOwner and CpiGuard.",
      "Accepting any mint without an allowlist or extension policy for a high-value vault.",
      "Treating a permanent delegate as harmless because the issuer seems reputable.",
    ],
    relatedGuides: [
      { slug: "vault-extensions", title: "CPI Guard & ImmutableOwner for Vaults" },
      { slug: "transfer-fees", title: "Transfer Fee Math That Auditors Flag" },
    ],
  },
  "fee-mint": {
    problem:
      "Transfer-fee mints withhold a fee during every transfer, so a bare transfer reverts and any ledger that recomputes fees in both directions slowly drifts: calculate_epoch_fee and the inverse helper round independently and are not exact inverses. The fee rate is also part of mint state and can change at an epoch boundary, so a cached basis-points value is wrong on the next epoch and treasury reports stop matching on-chain balances.",
    audience: "DEXs, payment apps, and treasuries integrating fee-on-transfer tokens.",
    when: [
      "You integrate a Token-2022 mint that carries the TransferFee extension.",
      "Your accounting computes fees in more than one direction.",
      "Treasury reports diverge from on-chain balances after many transfers.",
    ],
    workflow: [
      {
        step: "Scan the fee mint example",
        detail:
          "Load the fee mint sample in the analyzer, or scan fee_mint_program.rs locally. It surfaces the fee findings T22-005 and T22-006 alongside the SPL migration findings.",
      },
      {
        step: "Move to transfer_checked_with_fee",
        detail:
          "Replace the transfer with transfer_checked_with_fee, passing decimals and the exact fee you computed. Pick a single direction for your internal accounting and keep it.",
      },
      {
        step: "Resolve the fee per epoch",
        detail:
          "Read the fee for the current epoch with calculate_epoch_fee rather than assuming a static rate (T22-021). The transfer fee guide has the full pattern.",
      },
      {
        step: "Gate it in CI",
        detail:
          "Add --only=T22-005,T22-006,T22-021 to the scan on pull requests that touch token movement, so a regression in fee handling fails the build.",
      },
    ],
    whatWeCatch: [
      "T22-005: a bare transfer instead of transfer_checked_with_fee.",
      "T22-006: calculate fee and inverse-fee helpers mixed in one accounting path.",
      "T22-021: the epoch fee transition not handled, so the wrong rate is used.",
    ],
    avoid: [
      "Treating the fee as optional; fee mints and hooked mints revert on a legacy transfer.",
      "Using the inverse-fee helper to reconstruct a gross amount you already had.",
      "Caching a basis-points value at startup and reusing it across epochs.",
    ],
    relatedGuides: [
      { slug: "transfer-fees", title: "Transfer Fee Math That Auditors Flag" },
      { slug: "extension-pointers", title: "Pointer & Pausable Extensions" },
    ],
  },
  "extension-metadata": {
    problem:
      "GroupPointer, MemberPointer, MetadataPointer, and ScaledUiAmount move metadata and pricing off the mint base state into accounts the mint points to. Trusting those pointers without validating the link, or pricing on the raw amount without applying the multiplier, lets attackers spoof group membership and token metadata or distort balances. Pausable transfers and stale mint authority after a CPI add two more runtime surprises.",
    audience: "Token launchers, RWA platforms, and apps that read Token-2022 metadata or custom UI amounts.",
    when: [
      "Your mint uses MetadataPointer or group and member pointers.",
      "You display a token symbol or name read from a pointer account.",
      "You price a ScaledUiAmount mint, or move tokens on a Pausable mint.",
    ],
    workflow: [
      {
        step: "Try the extensions sample",
        detail:
          "Open the extensions sample in the analyzer to see findings across pointer validation, scaled amount, fee epoch, pause, and post-CPI authority.",
      },
      {
        step: "Validate links at init and on read",
        detail:
          "Pointer validation belongs both at mint init and in any instruction that reads metadata or group membership. Confirm the metadata account matches the mint pointer and authority before trusting it (T22-019).",
      },
      {
        step: "Fix pricing and pause paths",
        detail:
          "Apply the ScaledUiAmount multiplier before pricing or display (T22-020), and read the pause flag before transferring on a Pausable mint (T22-023).",
      },
      {
        step: "Reload the mint after a CPI",
        detail:
          "If an instruction CPIs and then reads mint_authority, reload the mint from chain first so a swapped authority cannot be used from cached data (T22-025).",
      },
    ],
    whatWeCatch: [
      "T22-018: group or member pointer not validated bidirectionally.",
      "T22-019: metadata pointer not validated against the mint.",
      "T22-020: scaled UI multiplier ignored when pricing on raw amount.",
      "T22-021: transfer fee epoch ignored on a fee-bearing mint.",
      "T22-023: pause state not checked before a transfer.",
      "T22-025: mint authority read after a CPI without a reload.",
    ],
    avoid: [
      "Reading metadata from whatever account the client passes instead of the mint's pointer target.",
      "Assuming pointer addresses are immutable without verifying them on chain.",
      "Pricing collateral on the raw amount of a scaled mint.",
    ],
    relatedGuides: [
      { slug: "extension-pointers", title: "Pointer & Pausable Extensions" },
      { slug: "token2022-not-spl", title: "Token-2022 Is Not SPL Token" },
    ],
  },
  "pre-audit": {
    problem:
      "Auditors are priced by depth, and reviewer hours spent on mechanical Token-2022 extension bugs are hours not spent on the economic and access-control attacks only a human finds. Arriving with the known footguns fixed, and a scan report attached, removes the easy findings and focuses the engagement where it adds the most value.",
    audience: "Founders and lead developers one to two weeks before an external audit.",
    when: [
      "Audit kickoff is scheduled and code freeze is approaching.",
      "You want a structured pass before paying for review hours.",
      "You need a findings export for the audit firm in Markdown or SARIF.",
    ],
    workflow: [
      {
        step: "Run a full scan with tests",
        detail:
          "Run the unit tests, then scan all programs with a high fail threshold. Export Markdown or SARIF for the audit package.",
      },
      {
        step: "Triage by extension area",
        detail:
          "Group the findings into hooks, vault and custody, fees, and pointers, and assign an owner to each area.",
      },
      {
        step: "Attach benchmark context",
        detail:
          "Link the benchmark results, which show zero findings on the secure sample and the expected findings on the intentionally bad examples, so reviewers can trust the engine's coverage.",
      },
      {
        step: "Document accepted risks",
        detail:
          "List the medium and low findings you defer, each with a rationale and any compensating control. Reviewers value an honest baseline over a claimed clean result.",
      },
    ],
    whatWeCatch: [
      "T22-001: critical hook guard gaps, prioritized before handoff.",
      "T22-004: SPL-only wiring that excludes Token-2022 mints.",
      "T22-007: permanent delegate not screened on custody paths.",
      "T22-016: mint close authority not required to be disabled.",
    ],
    avoid: [
      "Claiming a clean scan replaces an audit; it clears known integration footguns, nothing more.",
      "Hiding medium findings the auditors will surface anyway.",
      "Handing over a report without stating the scope the tool does not cover.",
    ],
    relatedGuides: [
      { slug: "pre-audit-prep", title: "Pre-Audit Prep Workflow" },
      { slug: "transfer-hook-checklist", title: "Transfer Hook Security Checklist" },
    ],
  },
  "ci-gate": {
    problem:
      "Token-2022 regressions land in pull requests the same way SPL bugs do: a quick legacy transfer in a hook path, a hardcoded account size, or a missing extension check. Without a CI gate, nobody runs the linter until mainnet, and the bug ships with the feature that introduced it.",
    audience: "Teams using GitHub Actions with an Anchor programs directory in the repo.",
    when: [
      "You merge Anchor code through pull requests.",
      "Multiple developers touch token integration code.",
      "You want findings surfaced in the GitHub Security tab.",
    ],
    workflow: [
      {
        step: "Copy the workflow",
        detail:
          "Use the bundled GitHub Actions workflow, which runs the tests, scans with a fail threshold, and uploads SARIF.",
      },
      {
        step: "Point it at your programs path",
        detail:
          "Change the scanned path from the examples directory to your Anchor programs or workspace path.",
      },
      {
        step: "Set the fail threshold",
        detail:
          "Use --fail-on=high to block on high and critical. Acknowledge specific checks you accept with --except, and document the exclusion in the PR.",
      },
      {
        step: "Run it without cloning, optionally",
        detail:
          "After the package is published, use npx token2022-guard in the workflow so consumers do not need to clone the linter repo.",
      },
    ],
    whatWeCatch: [
      "T22-001: hook transferring-state regressions on every PR.",
      "T22-002: an in-hook same-mint transfer reintroduced in a refactor.",
      "T22-010: a vault account that loses its CpiGuard.",
      "The full catalog runs on each PR; SARIF surfaces it as code-scanning alerts.",
    ],
    avoid: [
      "Scanning only on release branches; hook and wiring regressions happen in feature PRs.",
      "Forgetting the security-events write permission, which silently drops the SARIF upload.",
      "Suppressing a check globally instead of documenting an exclusion per repo.",
    ],
    relatedGuides: [
      { slug: "ci-setup", title: "Gate PRs with Token2022 Guard + SARIF" },
      { slug: "npm-ci", title: "npx token2022-guard in CI" },
    ],
  },
  "hackathon": {
    problem:
      "Hackathon timelines skip audits, but a Token-2022 demo still fails live if the program copies SPL patterns: a hooked mint reverts on a legacy transfer, a fixed account size fails init, or a missing hook guard breaks the flow on stage. A five-minute scan before demo day catches the mistakes that most often break a live demo.",
    audience: "Hackathon teams and solo builders shipping a vertical slice in days.",
    when: [
      "Your demo uses a Token-2022 mint with hooks or fees.",
      "There is no time for a formal audit and you need fast feedback.",
      "You want findings in the browser without setting up CI.",
    ],
    workflow: [
      {
        step: "Paste into the web UI",
        detail:
          "Open the analyzer, load the vulnerable sample to see what the checks look like, then paste your own program.",
      },
      {
        step: "Fix critical and high first",
        detail:
          "T22-001 and T22-004 block most broken demos: a hook callable directly, and SPL-only wiring that rejects the Token-2022 mint. Fix those before any polish.",
      },
      {
        step: "Scan locally if you prefer",
        detail:
          "Run the scan against your programs directory from the terminal, or via npx once the package is published.",
      },
      {
        step: "Ship the demo",
        detail:
          "Note the known medium findings in your README; judges care that you reasoned about security, not that the scan was perfectly clean.",
      },
    ],
    whatWeCatch: [
      "T22-001: a hook with no transferring-state guard.",
      "T22-004: SPL-only wiring that rejects Token-2022 mints.",
      "T22-009: a hardcoded account size that fails init on extension mints.",
      "T22-012: a hook with no Anchor fallback, silently bypassed.",
    ],
    avoid: [
      "Skipping the scan because it is just a hackathon; hooked mints fail live on stage.",
      "Using a mainnet mint in the demo without confirming your program supports Token-2022.",
      "Hardcoding decimals or account size to get a quick build working.",
    ],
    relatedGuides: [
      { slug: "cli-quickstart", title: "CLI Quickstart" },
      { slug: "token2022-not-spl", title: "Token-2022 Is Not SPL Token" },
    ],
  },
};
