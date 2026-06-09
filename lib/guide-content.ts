const SITE_GITHUB = "https://github.com/panagot/token2022-guard";

export interface GuideSection {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  numbered?: string[];
  code?: string;
  callout?: { type: "tip" | "warn"; text: string };
}

export interface GuideContent {
  title: string;
  summary: string;
  sections: GuideSection[];
  relatedChecks: string[];
  ctaHref: string;
  ctaLabel: string;
}

export const GUIDE_CONTENT: Record<string, GuideContent> = {
  "token2022-not-spl": {
    title: "Token-2022 Is Not SPL Token",
    summary:
      "Token-2022 is a separate program with a different id, variable account sizes, and extensions that can move tokens, charge fees, and run code during a transfer. This guide maps what breaks when you copy SPL patterns and how to scan for each failure.",
    relatedChecks: ["T22-004", "T22-005", "T22-009", "T22-022", "T22-026"],
    ctaHref: "/?sample=vulnerable",
    ctaLabel: "Try vulnerable sample",
    sections: [
      {
        paragraphs: [
          "Token-2022 (the Token Extensions program) is often treated as a drop-in upgrade to SPL Token. It is not. It ships under a different program id, so an account hardcoded to the SPL Token id will silently exclude every Token-2022 mint. Account data is no longer a fixed size: each extension appends a typed, length-value record, so a mint or token account can be hundreds of bytes larger than the legacy layout. And several extensions change what a transfer means: a transfer can invoke a hook program, deduct a fee in flight, be blocked by a pause flag, or be moved by a permanent delegate you never approved.",
          "Most of the incidents modeled in Token2022 Guard come from copying SPL Token tutorials directly into a Token-2022 integration. The code compiles, passes a happy-path devnet test against a plain mint, then reverts or misbehaves the first time it meets a real extension-bearing mint on mainnet.",
        ],
      },
      {
        heading: "What breaks when you copy SPL patterns",
        bullets: [
          "Fixed Mint::LEN or space = 165: init under-allocates and fails the moment the mint or account carries extensions (T22-009).",
          "anchor_spl::token or a hardcoded spl_token::ID: Token-2022 mints are rejected or mishandled because they are owned by a different program (T22-004).",
          "token::transfer without decimals: reverts on fee mints and hooked mints, and can misreport the moved amount (T22-005).",
          "Assuming every mint is transferable: NonTransferable mints revert ordinary transfers at runtime (T22-022).",
          "Ignoring frozen AccountState: a frozen source or destination aborts the transfer mid-instruction and strands the user flow (T22-026).",
        ],
      },
      {
        heading: "Use the interface, not the concrete program",
        paragraphs: [
          "The single highest-leverage change is to stop binding to one token program. Swap anchor_spl::token for anchor_spl::token_interface so Anchor accepts an account owned by either SPL Token or Token-2022, and validates the mint against whichever program actually owns it. InterfaceAccount deserializes the base state and ignores trailing extension bytes, so the same handler works for plain and extension-bearing mints.",
        ],
        code: `use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

#[derive(Accounts)]
pub struct MoveTokens<'info> {
    #[account(mut)]
    pub from: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub to: InterfaceAccount<'info, TokenAccount>,
    pub authority: Signer<'info>,
    // Accepts SPL Token *or* Token-2022, validated by the account owner.
    pub token_program: Interface<'info, TokenInterface>,
}

pub fn move_tokens(ctx: Context<MoveTokens>, amount: u64) -> Result<()> {
    let cpi = TransferChecked {
        from: ctx.accounts.from.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.to.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    // decimals come from the mint, never a hardcoded constant.
    transfer_checked(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi),
        amount,
        ctx.accounts.mint.decimals,
    )
}`,
      },
      {
        heading: "Size accounts dynamically",
        paragraphs: [
          "Extensions make account size data-dependent, so the length must be computed from the exact extension set you intend to enable. Compute it with the helper and fund rent for that exact size; never reuse the legacy 165-byte or Mint::LEN constants (T22-009).",
        ],
        code: `use spl_token_2022::extension::ExtensionType;
use spl_token_2022::state::Mint as Token2022Mint;

let space = ExtensionType::try_calculate_account_len::<Token2022Mint>(&[
    ExtensionType::TransferFeeConfig,
    ExtensionType::MetadataPointer,
])?;
let rent = Rent::get()?.minimum_balance(space);`,
      },
      {
        heading: "Migration checklist",
        numbered: [
          "Replace anchor_spl::token with anchor_spl::token_interface, and switch Account/Program to InterfaceAccount and Interface<'_, TokenInterface>.",
          "Replace transfer with transfer_checked (or transfer_checked_with_fee for fee mints) and pass mint plus decimals from the account, not a constant.",
          "Compute account size with ExtensionType::try_calculate_account_len::<Mint>(&[...]) for every init path.",
          "Before accepting external deposits, read the mint extensions and apply a policy: permanent delegate (T22-007), close authority (T22-016), NonTransferable (T22-022), Pausable (T22-023).",
          "Check source and destination AccountState before transferring so a frozen account fails loudly in tests, not on mainnet (T22-026).",
          "Run a scan after each migration phase and clear high and critical before moving on. See /checks for the full catalog.",
        ],
      },
      {
        heading: "Scan commands",
        code: `# Full program tree, fail the run on high or critical
npm run scan -- ./programs --fail-on=high

# Migration-focused checks only
npm run scan -- ./programs --only=T22-004,T22-005,T22-009

# After npm publish
npx token2022-guard ./programs --fail-on=high`,
      },
      {
        callout: {
          type: "warn",
          text: "A clean scan does not mean your program is safe on mainnet. It means you cleared the known Token-2022 integration footguns this engine models. Still commission a professional audit before custody of real funds.",
        },
      },
      {
        heading: "Where to go next",
        bullets: [
          "Migrating an existing program: /use-cases/spl-migration",
          "Accepting deposits into a vault: /guides/vault-extensions",
          "Integrating a fee-on-transfer mint: /guides/transfer-fees",
          "Shipping a hackathon demo on a Token-2022 mint: /use-cases/hackathon",
        ],
      },
    ],
  },
  "transfer-hook-checklist": {
    title: "Transfer Hook Security Checklist",
    summary:
      "Six audit-derived guards every Token-2022 transfer hook should implement before mainnet, each mapped to a specific check. Walk the vulnerable and secure samples side by side to see every guard in context.",
    relatedChecks: ["T22-001", "T22-002", "T22-003", "T22-012", "T22-017", "T22-024"],
    ctaHref: "/?sample=secure",
    ctaLabel: "Compare secure sample",
    sections: [
      {
        paragraphs: [
          "A transfer hook is a program that Token-2022 calls during every transfer of a hooked mint. It is invoked through the spl-transfer-hook-interface Execute instruction, addressed by an interface discriminator, not through your ordinary Anchor instruction handler. That single fact drives most of the footguns below: the hook can be reached in ways you did not wire by hand, and the accounts it receives are supplied by the caller.",
          "Compare the two reference programs while you read. The vulnerable sample at /?sample=vulnerable fails the first four checks; the secure sample at /?sample=secure passes all of them with no high or critical findings. Each section maps to a check in /checks.",
        ],
      },
      {
        heading: "1. Assert the transferring state (T22-001, critical)",
        paragraphs: [
          "When Token-2022 runs a hook during a real transfer, it temporarily sets the transferring flag in the source account's TransferHookAccount extension. If you do not read that flag, anyone can build a transaction that calls your hook directly, outside any transfer, and run your policy logic with attacker-chosen accounts. This is the single most common critical finding in Token-2022 hook reviews.",
          "Read the extension at the top of the handler and reject when the flag is not set. The secure sample factors this into an assert_is_transferring helper.",
        ],
        code: `use spl_token_2022::extension::transfer_hook::TransferHookAccount;
use spl_token_2022::extension::{BaseStateWithExtensions, StateWithExtensions};
use spl_token_2022::state::Account as Token2022Account;

fn assert_is_transferring(source: &AccountInfo) -> Result<()> {
    let data = source.try_borrow_data()?;
    let state = StateWithExtensions::<Token2022Account>::unpack(&data)
        .map_err(|_| error!(HookError::BadAccount))?;
    let ext = state.get_extension::<TransferHookAccount>()
        .map_err(|_| error!(HookError::NotTransferring))?;
    if !bool::from(ext.transferring) {
        return Err(error!(HookError::NotTransferring));
    }
    Ok(())
}`,
        callout: {
          type: "warn",
          text: "Treat this as a hard gate, not a warning. Without it, every other guard in the hook can be exercised by an attacker on accounts they control.",
        },
      },
      {
        heading: "2. Build ExtraAccountMetaList from validated seeds (T22-003)",
        paragraphs: [
          "Extra accounts (whitelists, policy PDAs, config) are resolved from the on-chain ExtraAccountMetaList you write during initialization. If you store fixed addresses or accept whatever the caller passes, an attacker can substitute a look-alike account with the same layout. Define each extra account as a Seed derivation so the address is reproduced from data the runtime controls, then re-derive and compare inside the hook.",
        ],
        bullets: [
          "Describe extra accounts with Seed::Literal, Seed::AccountKey, or Seed::AccountData rather than raw pubkeys.",
          "Inside the hook, re-derive every PDA with find_program_address and compare with require_keys_eq! before trusting it.",
          "Do not assume position in the account list implies identity; the caller controls ordering.",
        ],
      },
      {
        heading: "3. Stay acyclic: no same-mint CPI (T22-002)",
        paragraphs: [
          "Calling transfer_checked on the same mint from inside the hook re-enters the hook, which transfers again, which re-enters: the transaction recurses until it exhausts the stack or compute budget. Even a conditional in-hook transfer is a griefing and freeze risk. Keep the hook free of same-mint token movement.",
        ],
        code: `// Anti-pattern: this re-enters the hook on the same mint.
// transfer_checked(cpi_ctx, amount, decimals)?;

// Prefer: record intent and settle outside the hook path,
// or move a *different* mint and prove the call graph is acyclic.`,
        callout: {
          type: "tip",
          text: "If a CPI is unavoidable, move a different mint, or record the action and have a separate instruction settle it after the transfer completes.",
        },
      },
      {
        heading: "4. Wire the Anchor fallback (T22-012)",
        paragraphs: [
          "Token-2022 invokes the hook with the interface Execute discriminator, which Anchor's generated dispatcher does not recognize. Without a fallback, the hook is silently bypassed or fails. Add a fallback that unpacks the TransferHookInstruction and routes Execute to your handler. The secure_hook.rs sample shows the full pattern.",
        ],
        code: `use spl_transfer_hook_interface::instruction::TransferHookInstruction;

pub fn fallback<'info>(
    program_id: &Pubkey,
    accounts: &'info [AccountInfo<'info>],
    data: &[u8],
) -> Result<()> {
    match TransferHookInstruction::unpack(data)? {
        TransferHookInstruction::Execute { amount } => {
            __private::__global::transfer_hook(program_id, accounts, &amount.to_le_bytes())
        }
        _ => Err(ProgramError::InvalidInstructionData.into()),
    }
}`,
      },
      {
        heading: "5. Validate extra-account owners (T22-017)",
        paragraphs: [
          "Even with a seed-derived list, a hook that reads whitelist, policy, or gate accounts must verify their owner program and re-derive their PDA inside the handler. The secure sample re-derives the whitelist PDA from find_program_address and rejects any mismatch with require_keys_eq! before reading its contents. Trusting account contents because the account is present is the bypass auditors look for.",
        ],
      },
      {
        heading: "6. Verify hook upgrade authority (T22-024)",
        paragraphs: [
          "Before pointing a production mint at an external hook program (or before integrating a partner's mint), confirm the hook program's upgrade authority is revoked or held by a multisig you trust. An upgradeable hook can be swapped to malicious logic after users and integrators already depend on it. Inspect the BPF Upgradeable Loader program-data account to read the current upgrade authority.",
        ],
        callout: {
          type: "tip",
          text: "Reviewing a hook you did not write? See /use-cases/hook-review for a focused third-party due-diligence pass.",
        },
      },
      {
        heading: "Scan your hook",
        code: `# Full hook crate, block on high and critical
npm run scan -- ./programs/transfer-hook --fail-on=high

# The four hook-specific checks
npm run scan -- ./programs/transfer-hook --only=T22-001,T22-002,T22-003,T22-012`,
      },
      {
        heading: "Where to go next",
        bullets: [
          "Building your first hook: /use-cases/transfer-hook",
          "Vetting a third-party hook: /use-cases/hook-review",
          "Full check catalog: /checks",
        ],
      },
    ],
  },
  "transfer-fees": {
    title: "Transfer Fee Math That Auditors Flag",
    summary:
      "Fee mints deduct value in flight, so transfers need explicit fee context and epoch-aware reads. Mixing the two fee helpers drifts balances, and a static fee basis-points read breaks at epoch boundaries.",
    relatedChecks: ["T22-005", "T22-006", "T22-021"],
    ctaHref: "/?sample=fee_mint",
    ctaLabel: "Try fee mint sample",
    sections: [
      {
        paragraphs: [
          "The TransferFee extension withholds a fee from each transfer and accrues it on the destination account, where the mint's withdraw-withheld authority later harvests it. Two things follow. First, a transfer must carry decimals and an expected fee, so legacy transfer() is unusable. Second, the fee rate is part of the mint state and can change at an epoch boundary, so any value you cache can be wrong on the next slot.",
          "The fee sample at /?sample=fee_mint deliberately combines the mistakes below. Use it as a regression fixture while you fix your own program.",
        ],
      },
      {
        heading: "Use transfer_checked_with_fee (T22-005)",
        paragraphs: [
          "Replace token::transfer with transfer_checked for non-fee mints and transfer_checked_with_fee for fee mints. The fee variant takes the amount, decimals, and the exact fee you computed, and the program asserts that the fee you pass matches the mint's configuration for the current epoch. Passing the wrong fee fails the instruction instead of silently under-collecting.",
        ],
        code: `use anchor_spl::token_interface::{
    transfer_checked_with_fee, TransferCheckedWithFee,
};

let cpi = TransferCheckedWithFee {
    token_program_id: ctx.accounts.token_program.to_account_info(),
    source: ctx.accounts.from.to_account_info(),
    mint: ctx.accounts.mint.to_account_info(),
    destination: ctx.accounts.to.to_account_info(),
    authority: ctx.accounts.authority.to_account_info(),
};
transfer_checked_with_fee(
    CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi),
    amount,
    ctx.accounts.mint.decimals,
    fee, // computed for the current epoch, see below
)?;`,
      },
      {
        heading: "Do not mix calculate_fee and calculate_inverse_fee (T22-006)",
        paragraphs: [
          "calculate_epoch_fee maps a gross amount to its fee; the inverse helper maps a desired net to the gross that produces it. They round independently, so they are not exact inverses. A ledger that computes a fee one way and reverses it the other way drifts by a unit per transfer, and after thousands of transfers the treasury no longer reconciles with on-chain balances. This is a recurring audit finding.",
        ],
        bullets: [
          "Pick one direction for your accounting: gross to net, or net to gross, and keep it for the whole code path.",
          "Settle with transfer_checked_with_fee using the exact fee you computed, rather than recomputing it inversely afterward.",
          "Store the gross amount and the fee actually applied; do not reconstruct one from the other later.",
        ],
        callout: {
          type: "warn",
          text: "Treasury reconciliation drift after many transfers is a classic finding. It is almost always traced to inverse-fee misuse rather than a single large error.",
        },
      },
      {
        heading: "Read the fee for the current epoch (T22-021)",
        paragraphs: [
          "TransferFeeConfig stores both an older and a newer fee, plus the epoch at which the newer one takes effect. Reading transfer_fee_basis_points off a struct without consulting the clock will use a stale rate across the boundary. Always resolve the fee for the current epoch before pricing or moving tokens.",
        ],
        code: `use spl_token_2022::extension::transfer_fee::TransferFeeConfig;
use spl_token_2022::extension::{BaseStateWithExtensions, StateWithExtensions};
use spl_token_2022::state::Mint as Token2022Mint;

let epoch = Clock::get()?.epoch;
let mint_data = ctx.accounts.mint.to_account_info().try_borrow_data()?;
let mint = StateWithExtensions::<Token2022Mint>::unpack(&mint_data)?;
let cfg = mint.get_extension::<TransferFeeConfig>()?;

// Resolves older vs newer fee based on the current epoch.
let fee = cfg.calculate_epoch_fee(epoch, amount).ok_or(ErrorCode::FeeOverflow)?;`,
      },
      {
        heading: "Example to scan",
        paragraphs: [
          "The fee_mint_program.rs example intentionally uses SPL-only wiring, deprecated transfer, and mixed fee math. Scanning it surfaces the fee findings (T22-005 and T22-006) alongside the SPL migration findings, which makes it a good fixture for a fee-focused CI filter.",
        ],
        code: `npm run scan -- ./examples/fee_mint_program.rs --json
npm run scan -- ./programs --only=T22-005,T22-006,T22-021 --fail-on=high`,
      },
      {
        heading: "Where to go next",
        bullets: [
          "Fee mint integration scenario: /use-cases/fee-mint",
          "Pointer and scaled-amount pricing pitfalls: /guides/extension-pointers",
          "Full check catalog: /checks",
        ],
      },
    ],
  },
  "vault-extensions": {
    title: "CPI Guard & ImmutableOwner for Vaults",
    summary:
      "Programs that custody Token-2022 tokens need two account-level guards on the accounts they own, plus an explicit policy for the mint extensions they will accept on deposit.",
    relatedChecks: ["T22-007", "T22-010", "T22-011", "T22-016", "T22-026"],
    ctaHref: "/use-cases/vault-deposit",
    ctaLabel: "Vault deposit use case",
    sections: [
      {
        paragraphs: [
          "A vault, escrow, or staking program holds user funds in token accounts it owns, and accepts mints it did not create. Both sides need attention. The accounts you own should be hardened so an outer CPI cannot drain them and so their owner cannot be reassigned. The mints you accept should be screened, because several extensions let a third party move or freeze the very tokens you are custodying.",
        ],
      },
      {
        heading: "CPI Guard on program-owned accounts (T22-010, high)",
        paragraphs: [
          "CpiGuard blocks privileged actions (transfer, approve, burn, close, set-authority) when they are driven by a cross-program invocation rather than a top-level instruction. Enable it on the token accounts your program owns so a malicious program in the same transaction cannot use a delegated path to move tokens out of the vault. It is enabled per account, after creation, by the account owner.",
        ],
        bullets: [
          "Enable CpiGuard on vault PDAs your program owns, not on user-owned ATAs.",
          "Enabling it requires the account owner to sign, so do it during your account setup instruction.",
          "It is defense in depth; it does not replace validating the authority on every withdrawal.",
        ],
      },
      {
        heading: "ImmutableOwner on custodied accounts (T22-011)",
        paragraphs: [
          "Without ImmutableOwner, a token account's owner field can be reassigned with SetAuthority, which enables account-hijacking against a vault. Set ImmutableOwner when you create accounts your program controls. Associated Token Accounts created through the ATA program include it by default; raw token accounts you create with the token program do not, so opt in explicitly.",
        ],
        callout: {
          type: "tip",
          text: "If your vault uses ATAs created via the Associated Token Account program, ImmutableOwner is already set. Audit any place you create a bare token account directly.",
        },
      },
      {
        heading: "Screen incoming mint extensions",
        paragraphs: [
          "On deposit, read the mint's extensions and apply a policy before you take custody. Several extensions break the assumption that deposited funds stay put until your program releases them.",
        ],
        bullets: [
          "PermanentDelegate (T22-007): a fixed delegate can move tokens from any account on the mint, including your vault. Refuse the mint or allowlist a delegate you trust.",
          "Mint close authority (T22-016): if the mint can still be closed, accounting and downstream references can be invalidated. Require close_authority is None or an authority you trust.",
          "NonTransferable (T22-022): ordinary transfers revert, so the asset cannot leave the vault normally.",
          "Pausable (T22-023): transfers halt while the mint is paused; withdrawals can fail until it resumes.",
          "Frozen AccountState (T22-026): check source and destination state before transferring so a frozen account fails in tests, not on a user withdrawal.",
        ],
      },
      {
        heading: "Reading a mint extension in Anchor",
        code: `use spl_token_2022::extension::permanent_delegate::PermanentDelegate;
use spl_token_2022::extension::{BaseStateWithExtensions, StateWithExtensions};
use spl_token_2022::state::Mint as Token2022Mint;

let data = ctx.accounts.mint.to_account_info().try_borrow_data()?;
let mint = StateWithExtensions::<Token2022Mint>::unpack(&data)?;

if let Ok(delegate) = mint.get_extension::<PermanentDelegate>() {
    let pd: Option<Pubkey> = delegate.delegate.into();
    require!(
        pd.map_or(true, |k| TRUSTED_DELEGATES.contains(&k)),
        VaultError::UntrustedPermanentDelegate
    );
}`,
      },
      {
        heading: "Deposit flow scan",
        code: `# Vault-specific extension policy checks
npm run scan -- ./programs --only=T22-007,T22-010,T22-011,T22-016

# Full run, block on high and critical
npm run scan -- ./programs --fail-on=high`,
      },
      {
        callout: {
          type: "warn",
          text: "High-value vaults should pair these guards with an allowlist or explicit extension policy. Accepting arbitrary mints means accepting whatever authorities their issuers retain.",
        },
      },
      {
        heading: "Where to go next",
        bullets: [
          "Full deposit-acceptance scenario: /use-cases/vault-deposit",
          "Migrating a vault off SPL Token: /guides/token2022-not-spl",
          "Full check catalog: /checks",
        ],
      },
    ],
  },
  "extension-pointers": {
    title: "Pointer & Pausable Extensions",
    summary:
      "Pointer and scaled-amount extensions move metadata and pricing off the mint base state. Reading them without validation enables spoofed membership and metadata, wrong pricing, and stale authority after a CPI.",
    relatedChecks: ["T22-018", "T22-019", "T22-020", "T22-021", "T22-023", "T22-025"],
    ctaHref: "/?sample=extensions",
    ctaLabel: "Try extensions sample",
    sections: [
      {
        paragraphs: [
          "GroupPointer, MemberPointer, MetadataPointer, ScaledUiAmount, and Pausable are increasingly common on launched mints. They share a theme: the data you care about lives in, or is governed by, an account the mint points to, and the safety of the integration depends on validating that link. The extensions sample at /?sample=extensions exercises every check in this guide.",
        ],
      },
      {
        heading: "Group and member pointers (T22-018)",
        paragraphs: [
          "A GroupPointer on a mint names a group account, and a MemberPointer names a member record. Trusting one direction lets an attacker present a spoofed group or member that claims membership it does not have, which corrupts allowlists, governance weight, or display logic. Verify the link is bidirectional: the group the member points to must point back at, or contain, that member, and both must be governed by the authority you expect.",
        ],
      },
      {
        heading: "Metadata pointer (T22-019)",
        paragraphs: [
          "MetadataPointer names the account that holds the mint's name, symbol, and URI. If you read metadata from whatever account the client supplies, you can be shown attacker-controlled name and symbol values: phishing-grade spoofing of a known token. Require that the metadata account is the one the mint points to and that its update authority matches the mint authority or a known program PDA before you read or display it.",
        ],
        code: `// Validate the pointer target before trusting metadata.
let mint_data = ctx.accounts.mint.to_account_info().try_borrow_data()?;
let mint = StateWithExtensions::<Token2022Mint>::unpack(&mint_data)?;
let pointer = mint.get_extension::<MetadataPointer>()?;
let target: Option<Pubkey> = pointer.metadata_address.into();
require_keys_eq!(
    target.ok_or(ErrorCode::NoMetadata)?,
    ctx.accounts.metadata.key(),
    ErrorCode::MetadataPointerMismatch
);`,
      },
      {
        heading: "Scaled UI amount (T22-020)",
        paragraphs: [
          "ScaledUiAmount stores a multiplier alongside the raw amount so the displayed balance is amount times multiplier. Pricing, TVL, or collateral math on the raw .amount alone misstates value, often badly after the multiplier updates. Apply the multiplier, or use the amount_to_ui_amount conversion helper, anywhere you turn a raw balance into a number a human or an oracle sees.",
        ],
      },
      {
        heading: "Pausable (T22-023)",
        paragraphs: [
          "A Pausable mint can halt transfers at runtime when its pause authority acts. Integrators that move tokens without reading the pause state see unexplained reverts after a mint is paused by governance. Read the pause flag and fail early with a clear error, rather than letting the token program revert deep inside a CPI.",
        ],
      },
      {
        heading: "Transfer fee epoch (T22-021)",
        paragraphs: [
          "Mints that combine a pointer extension with TransferFee still need epoch-aware fee reads. A static basis-points read picks the wrong rate across an epoch boundary. See /guides/transfer-fees for the calculate_epoch_fee pattern; it applies here whenever a transfer touches a fee mint.",
        ],
      },
      {
        heading: "Mint authority after a CPI (T22-025)",
        paragraphs: [
          "Anchor caches deserialized account data. If you call a CPI that can change the mint (for example a SetAuthority), then read mint_authority from the cached struct, you are reading a stale value: a malicious CPI can swap the authority between the call and your read. Reload the mint account from chain after any CPI that could touch it before trusting mint_authority.",
        ],
        code: `// After a CPI that can mutate the mint, reload before reading authority.
invoke(&set_authority_ix, &account_infos)?;
ctx.accounts.mint.reload()?; // re-read from chain, do not trust cached data
let authority: Option<Pubkey> = ctx.accounts.mint.mint_authority.into();`,
        callout: {
          type: "tip",
          text: "T22-025 uses code-aware detection: a comment that mentions reload does not suppress the finding. The actual reload or re-read must be present in code.",
        },
      },
      {
        heading: "Benchmark example",
        paragraphs: [
          "The extensions_program.rs example triggers findings across pointer validation, scaled amount, fee epoch, pause, and post-CPI authority. It is part of the benchmark corpus and is available as /?sample=extensions in the analyzer, so you can use it both as a learning fixture and a regression baseline.",
        ],
        code: `npm run scan -- ./examples/extensions_program.rs --json
npm run benchmark   # extensions program is in the corpus`,
      },
      {
        heading: "Where to go next",
        bullets: [
          "Pointer and metadata scenario: /use-cases/extension-metadata",
          "Fee math and epoch reads: /guides/transfer-fees",
          "Full check catalog: /checks",
        ],
      },
    ],
  },
  "pre-audit-prep": {
    title: "Pre-Audit Prep Workflow",
    summary:
      "Hand auditors a clean Token-2022 integration report instead of a surprise list of extension footguns on day one. A structured pass before kickoff lets reviewers spend their hours on business logic.",
    relatedChecks: ["T22-001", "T22-004", "T22-007", "T22-016"],
    ctaHref: "/use-cases/pre-audit",
    ctaLabel: "Pre-audit use case",
    sections: [
      {
        paragraphs: [
          "Audits are priced by depth, and reviewer hours spent on mechanical extension bugs are hours not spent on economic attacks, oracle trust, and access control. Running Token2022 Guard one to two weeks before kickoff clears the recurring footguns and produces an artifact you can attach to the engagement: here is what we already checked, and here is what we consciously deferred.",
        ],
      },
      {
        heading: "Two weeks out: baseline scan",
        numbered: [
          "Run the unit tests to confirm the engine itself is green and every check has fixture coverage.",
          "Run a full scan with a high fail threshold and fix every high and critical finding first.",
          "Export a Markdown report for the audit package.",
          "Optionally export SARIF for firms with code-scanning tooling.",
        ],
        code: `npm test
npm run scan -- ./programs --fail-on=high
npm run scan -- ./programs --md > t22-report.md
npm run scan -- ./programs --sarif > t22.sarif`,
      },
      {
        heading: "One week out: triage and document",
        bullets: [
          "Group the remaining medium and low findings by area: hooks, vault and custody, fees, pointers.",
          "Assign an owner per area; either fix the finding or document why you accept the risk.",
          "For each deferred finding, write the rationale and the compensating control, if any.",
          "Link the benchmark results so reviewers can see the engine reports zero findings on the secure sample and the expected findings on the intentionally bad examples.",
        ],
      },
      {
        heading: "What to tell auditors",
        paragraphs: [
          "Token2022 Guard is static heuristics: a complement to manual review, not a replacement. Frame the report as known integration checks cleared, plus an explicit list of deferred findings with rationale. Reviewers respect a documented, honest baseline far more than a claim of a clean bill of health, and it directs their attention to the logic only a human can assess.",
        ],
        callout: {
          type: "warn",
          text: "Do not claim the tool replaces manual review of hook economics, oracle trust, signer and access control, or upgrade governance. State the scope plainly in the report.",
        },
      },
      {
        heading: "Where to go next",
        bullets: [
          "The full pre-audit scenario: /use-cases/pre-audit",
          "Gate the same checks on every PR: /guides/ci-setup",
          "Full check catalog: /checks",
        ],
      },
    ],
  },
  "ci-setup": {
    title: "Gate PRs with Token2022 Guard + SARIF",
    summary:
      "Fail builds on high and critical Token-2022 findings and surface every finding in the GitHub Security tab, so regressions are caught in the pull request rather than on mainnet.",
    relatedChecks: ["T22-001", "T22-002", "T22-010"],
    ctaHref: `${SITE_GITHUB}/blob/main/.github/workflows/token2022-guard.yml`,
    ctaLabel: "View workflow on GitHub",
    sections: [
      {
        paragraphs: [
          "Token-2022 regressions land in pull requests the same way SPL bugs do: a quick legacy transfer in a hook path, a hardcoded account size, a missing extension check. Without CI, nobody runs the linter until mainnet. The repo ships a ready workflow under the .github workflows directory that runs on every push and pull request: it installs dependencies, runs the unit tests, scans with a fail threshold, generates SARIF, and uploads it to the Security tab.",
        ],
      },
      {
        heading: "Copy it into your repo",
        numbered: [
          "Copy the workflow file into your project's .github workflows directory.",
          "Change the scanned path from the examples directory to your Anchor programs directory.",
          "Add permissions with security-events set to write so the SARIF upload step can post results.",
          "Commit and open a pull request; the first run establishes your baseline.",
        ],
      },
      {
        heading: "What each step does",
        bullets: [
          "npm ci: install the pinned dependencies.",
          "npm test: run the unit suite so a broken engine fails fast.",
          "The scan step with a high fail threshold: block the PR when any high or critical finding is present.",
          "SARIF upload: surface findings under Security and Code scanning alerts, with line-level annotations.",
        ],
      },
      {
        heading: "Tuning noisy checks",
        paragraphs: [
          "Until a config file ships, tune the run with CLI filters. Prefer --except to acknowledge a specific check you accept for a repo, and --only to focus a path-scoped job. Document any exclusion in the PR so it is a conscious decision, not silent suppression.",
        ],
        code: `# Acknowledge checks you accept for this repo, still block the rest
npm run scan -- ./programs --except=T22-007,T22-026 --fail-on=high

# Hook-only job for a hooks package
npm run scan -- ./programs/transfer-hook --only=T22-001,T22-002,T22-003`,
      },
      {
        callout: {
          type: "tip",
          text: "Run the exact same command locally before pushing. CI should confirm findings, not be the first place you discover them.",
        },
      },
      {
        heading: "Where to go next",
        bullets: [
          "Run it without cloning the repo: /guides/npm-ci",
          "All CLI flags and output formats: /guides/cli-quickstart",
          "The CI gate scenario: /use-cases/ci-gate",
        ],
      },
    ],
  },
  "npm-ci": {
    title: "npx token2022-guard in CI",
    summary:
      "Run the published package in CI without cloning the Token2022 Guard repository. The CLI ships with a small runtime footprint and a smoke-tested install path.",
    relatedChecks: [],
    ctaHref: "/guides/cli-quickstart",
    ctaLabel: "CLI quickstart",
    sections: [
      {
        paragraphs: [
          "Cloning a linter into every consumer repo is friction. After the package is published, consumers run npx token2022-guard with a minimal runtime dependency footprint: the scan engine and CLI only, no Next.js and no web UI. The package is verified with npm run smoke before publish, which packs the tarball, installs it into a fresh temporary directory, and runs a scan to prove the published entry point works.",
        ],
      },
      {
        heading: "GitHub Actions step",
        code: `- uses: actions/setup-node@v4
  with:
    node-version: 20

- name: Token2022 Guard
  run: npx token2022-guard@latest ./programs --fail-on=high`,
      },
      {
        heading: "Pin a version for reproducible CI",
        paragraphs: [
          "Use @latest for convenience or pin an exact version so a new release cannot change your gate without a commit. Pinning is recommended for protected branches.",
        ],
        code: `npx token2022-guard@1.0.0 ./programs --fail-on=high`,
      },
      {
        heading: "Verify the install path locally",
        code: `npm run smoke
# packs the tarball, installs into a fresh temp dir, runs a scan`,
      },
      {
        heading: "Publish (maintainers)",
        code: `npm login
npm publish`,
        callout: {
          type: "tip",
          text: "prepublishOnly runs the tests and the smoke check automatically, so a failing engine or a broken entry point blocks the publish.",
        },
      },
      {
        heading: "Where to go next",
        bullets: [
          "Full flag reference and output formats: /guides/cli-quickstart",
          "Wire it into a gated workflow with SARIF: /guides/ci-setup",
        ],
      },
    ],
  },
  "cli-quickstart": {
    title: "CLI Quickstart",
    summary:
      "Run the same 26-check engine from your terminal or CI. Table, JSON, SARIF, and Markdown output, severity-based exit codes, and check filters.",
    relatedChecks: [],
    ctaHref: "/",
    ctaLabel: "Open web analyzer",
    sections: [
      {
        paragraphs: [
          "The terminal, the web analyzer, and CI all run the identical analysis engine, so a finding in one appears in the others. The web analyzer at / is the fastest way to try it; the CLI is the way to gate it. Start from a clone, then move to npx once the package is published.",
        ],
      },
      {
        heading: "From a clone",
        code: `git clone https://github.com/panagot/token2022-guard.git
cd token2022-guard
npm install
npm run scan -- ./examples`,
      },
      {
        heading: "Output formats",
        bullets: [
          "Default table: a human-readable terminal report grouped by severity.",
          "--json: machine-readable output for scripts and dashboards.",
          "--sarif: GitHub code-scanning format for the Security tab.",
          "--md or --markdown: Markdown for PR comments or audit attachments.",
        ],
        code: `npm run scan -- ./programs --sarif > token2022-guard.sarif
npm run scan -- ./programs --md > report.md`,
      },
      {
        heading: "Exit codes for CI",
        paragraphs: [
          "Use --fail-on to make the process exit non-zero at or above a severity. Severity order, highest first: critical, high, medium, low. --fail-on=high therefore fails on high and critical.",
        ],
        code: `npm run scan -- ./programs --fail-on=high
echo $?   # 1 when a high or critical finding is present, else 0`,
      },
      {
        heading: "Filters",
        paragraphs: [
          "Scope a run to specific checks with --only, or exclude accepted checks with --except. Both take comma-separated check ids from /checks.",
        ],
        code: `npm run scan -- ./programs --only=T22-001,T22-002
npm run scan -- ./programs --except=T22-007,T22-026`,
      },
      {
        heading: "After npm publish",
        code: `npx token2022-guard ./programs --fail-on=high
npx token2022-guard --version`,
      },
      {
        heading: "Quality gates (maintainers)",
        code: `npm test          # unit tests, per-check fixtures
npm run smoke     # pack, fresh install, scan
npm run benchmark # refresh the benchmark corpus`,
      },
      {
        heading: "Where to go next",
        bullets: [
          "Gate pull requests with SARIF: /guides/ci-setup",
          "Run it without cloning: /guides/npm-ci",
          "Browse every check: /checks",
        ],
      },
    ],
  },
};
