/** Minimal per-check snippets for unit tests (isolated fire/pass). */
export const CHECK_FIXTURES: Record<string, { bad: string; good: string }> = {
  "T22-001": {
    bad: `use spl_transfer_hook_interface::instruction::ExecuteInstruction;
pub fn transfer_hook(ctx: Context<TransferHook>) -> Result<()> { Ok(()) }`,
    good: `use spl_transfer_hook_interface::instruction::ExecuteInstruction;
pub fn transfer_hook(ctx: Context<TransferHook>) -> Result<()> {
  assert_is_transferring(&ctx.accounts.source)?;
  Ok(())
}`,
  },
  "T22-002": {
    bad: `pub fn transfer_hook(ctx: Context<TransferHook>) -> Result<()> {
  token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi), 1)?;
  Ok(())
}`,
    good: `pub fn transfer_hook(ctx: Context<TransferHook>) -> Result<()> { Ok(()) }`,
  },
  "T22-003": {
    bad: `pub fn init(ctx: Context<Init>) -> Result<()> {
  let list = &ctx.accounts.extra_account_meta_list;
  let _ = ExtraAccountMetaList::size_of(0);
  Ok(())
}`,
    good: `pub fn init(ctx: Context<Init>) -> Result<()> {
  let _ = Seed::AccountKey;
  Ok(())
}`,
  },
  "T22-004": {
    bad: `use anchor_spl::token::{Token, TokenAccount, Mint};`,
    good: `use anchor_spl::token_interface::{TokenInterface, TokenAccount, Mint};`,
  },
  "T22-005": {
    bad: `token::transfer(CpiContext::new(prog, cpi), amount)?;`,
    good: `token_interface::transfer_checked(CpiContext::new(prog, cpi), amount, 6)?;`,
  },
  "T22-006": {
    bad: `let a = calculate_fee(x); let b = calculate_inverse_fee(x);`,
    good: `transfer_checked_with_fee(ctx, amount, 6, expected_fee)?;`,
  },
  "T22-007": {
    bad: `pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
  let vault: Account<TokenAccount> = ctx.accounts.vault;
  Ok(())
}`,
    good: `pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
  if let Ok(ext) = mint.get_extension::<PermanentDelegate>() { require!(ext.is_none()); }
  Ok(())
}`,
  },
  "T22-008": {
    bad: `// confidential_transfer enabled
let bal = account.amount;`,
    good: `let auditor = mint.get_extension::<ConfidentialTransferMint>()?.auditor_elgamal_pubkey;`,
  },
  "T22-009": {
    bad: `#[account(mut, space = 165)] pub vault: Account<TokenAccount>,`,
    good: `let len = ExtensionType::try_calculate_account_len::<Mint>(&[])?;`,
  },
  "T22-010": {
    bad: `pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
  let vault: Account<TokenAccount> = ctx.accounts.vault;
  Ok(())
}`,
    good: `pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
  enable_cpi_guard(&vault)?;
  Ok(())
}`,
  },
  "T22-011": {
    bad: `pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
  let vault: Account<TokenAccount> = ctx.accounts.vault;
  Ok(())
}`,
    good: `pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
  init_with_immutable_owner(&vault)?;
  Ok(())
}`,
  },
  "T22-012": {
    bad: `use spl_transfer_hook_interface::instruction::ExecuteInstruction;
#[program]
pub mod transfer_hook_program {}`,
    good: `pub fn fallback(program_id: &Pubkey, accounts: &[AccountInfo], data: &[u8]) -> Result<()> {
  __private::__global::transfer_hook(program_id, accounts, data)
}`,
  },
  "T22-013": {
    bad: `// RequiredMemoTransfer on destination
token_interface::transfer_checked(ctx, 1, 6)?;`,
    good: `invoke(&spl_memo::build_memo(b"pay", &[]), &[])?;
token_interface::transfer_checked(ctx, 1, 6)?;`,
  },
  "T22-014": {
    bad: `ExtensionType::DefaultAccountState { state: AccountState::Frozen }`,
    good: `thaw_account(CpiContext::new(prog, accounts))?;`,
  },
  "T22-015": {
    bad: `ExtensionType::InterestBearing { rate: 100 }
let price = mint_account.amount;`,
    good: `let ui = amount_to_ui_amount(mint_account.amount, rate);`,
  },
  "T22-016": {
    bad: `pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
  let vault: Account<TokenAccount> = ctx.accounts.vault;
  let mint: Account<Mint> = ctx.accounts.mint;
  Ok(())
}`,
    good: `pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
  require!(mint.close_authority.is_none(), ErrorCode::MintClosable);
  Ok(())
}`,
  },
  "T22-017": {
    bad: `use spl_transfer_hook_interface::instruction::ExecuteInstruction;
pub fn transfer_hook(ctx: Context<TransferHook>) -> Result<()> {
  let extra = &ctx.accounts.whitelist;
  Ok(())
}`,
    good: `pub fn transfer_hook(ctx: Context<TransferHook>) -> Result<()> {
  require_keys_eq!(extra.owner, program_id, Error);
  Ok(())
}`,
  },
  "T22-018": {
    bad: `ExtensionType::GroupPointer { group_address: g }
let member = member_pointer;`,
    good: `verify_group_member_bidirectional(&mint, &member_pointer)?;`,
  },
  "T22-019": {
    bad: `ExtensionType::MetadataPointer { metadata_address: m }
let meta = metadata_pointer;`,
    good: `require_keys_eq!(metadata.authority, mint.key(), Error);`,
  },
  "T22-020": {
    bad: `ExtensionType::ScaledUiAmount
let price = account.amount;`,
    good: `let ui = account.amount * multiplier;`,
  },
  "T22-021": {
    bad: `TransferFeeConfig { transfer_fee_basis_points: 100 }
token_interface::transfer_checked(ctx, amount, 6)?;`,
    good: `let epoch = clock.epoch;
let fee = mint.get_newer_transfer_fee(epoch);`,
  },
  "T22-022": {
    bad: `token_interface::transfer_checked(ctx, amount, 6)?;`,
    good: `if mint.get_extension::<NonTransferable>().is_ok() { return Err(...); }
token_interface::transfer_checked(ctx, amount, 6)?;`,
  },
  "T22-023": {
    bad: `ExtensionType::Pausable
token_interface::transfer_checked(ctx, 1, 6)?;`,
    good: `require!(!pausable.is_paused());
token_interface::transfer_checked(ctx, 1, 6)?;`,
  },
  "T22-024": {
    bad: `pub fn set_hook(ctx: Context<SetHook>, hook: Pubkey) -> Result<()> {
  mint.transfer_hook_program_id = hook;
  Ok(())
}`,
    good: `pub fn set_hook(ctx: Context<SetHook>, hook: Pubkey) -> Result<()> {
  verify_upgrade_authority(&hook_program)?;
  mint.transfer_hook_program_id = hook;
  Ok(())
}`,
  },
  "T22-025": {
    bad: `invoke(&ix, accounts)?;
let auth = ctx.accounts.mint.mint_authority;`,
    good: `invoke(&ix, accounts)?;
ctx.accounts.mint.reload()?;
verify_mint_authority(&ctx.accounts.mint)?;`,
  },
  "T22-026": {
    bad: `token::transfer(cpi, amount)?;`,
    good: `require!(source.state != AccountState::Frozen);
token::transfer(cpi, amount)?;`,
  },
};
