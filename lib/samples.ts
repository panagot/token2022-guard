export interface Sample {
  id: string;
  label: string;
  tag: string;
  description: string;
  source: string;
}

const VULNERABLE = `use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
use spl_transfer_hook_interface::instruction::ExecuteInstruction;

declare_id!("Hook1111111111111111111111111111111111111");

#[program]
pub mod vulnerable_hook {
    use super::*;

    // Transfer hook entrypoint. No transferring-state guard at all.
    pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
        // Whitelist gate (accounts are trusted blindly).
        require!(ctx.accounts.whitelist.allowed, HookError::NotAllowed);

        // Re-enters the same mint from inside the hook -> recursion risk.
        let cpi = Transfer {
            from: ctx.accounts.source.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi), amount)?;

        Ok(())
    }

    pub fn init_extra_account_meta_list(ctx: Context<InitMeta>) -> Result<()> {
        // ExtraAccountMetaList built without validated seeds.
        let extra_account_meta_list = &ctx.accounts.extra_account_meta_list;
        msg!("init {:?}", extra_account_meta_list.key());
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        // Fee math mixed both directions; no transfer_checked.
        let gross = spl_token::instruction::transfer; let _ = gross;
        let _fee = calculate_fee(amount);
        let _net = calculate_inverse_fee(amount);
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), Transfer {
                from: ctx.accounts.user_ata.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            }),
            amount,
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferHook<'info> {
    pub source: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub destination: Account<'info, TokenAccount>,
    pub owner: Signer<'info>,
    pub whitelist: Account<'info, Whitelist>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct InitMeta<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: raw meta list
    pub extra_account_meta_list: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_ata: Account<'info, TokenAccount>,
    #[account(mut, space = 165)]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Whitelist { pub allowed: bool }

#[error_code]
pub enum HookError { #[msg("not allowed")] NotAllowed }
`;

const SECURE = `use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use spl_transfer_hook_interface::error::TransferHookError;
use spl_token_2022::extension::transfer_hook::TransferHookAccount;
use spl_token_2022::extension::{BaseStateWithExtensions, StateWithExtensions};
use spl_token_2022::state::Account as Token2022Account;

declare_id!("Hook2222222222222222222222222222222222222");

#[program]
pub mod secure_hook {
    use super::*;

    pub fn transfer_hook(ctx: Context<TransferHook>, _amount: u64) -> Result<()> {
        // 1. Reject direct invocation: source must be mid-transfer.
        assert_is_transferring(&ctx.accounts.source.to_account_info())?;

        // 2. Re-derive the whitelist PDA from validated seeds (no trusted accounts).
        let (expected, _bump) =
            Pubkey::find_program_address(&[b"wl", ctx.accounts.owner.key().as_ref()], ctx.program_id);
        require_keys_eq!(expected, ctx.accounts.whitelist.key(), HookError::BadWhitelist);
        require!(ctx.accounts.whitelist.allowed, HookError::NotAllowed);

        // 3. No same-mint CPI transfer inside the hook -> acyclic by construction.
        Ok(())
    }
}

// Anchor fallback: Token-2022 calls the hook via the interface Execute discriminator,
// which Anchor will not route without this dispatcher.
pub fn fallback<'info>(
    program_id: &Pubkey,
    accounts: &'info [AccountInfo<'info>],
    data: &[u8],
) -> Result<()> {
    let instruction = TransferHookInstruction::unpack(data)?;
    match instruction {
        TransferHookInstruction::Execute { amount } => {
            __private::__global::transfer_hook(program_id, accounts, &amount.to_le_bytes())
        }
        _ => Err(ProgramError::InvalidInstructionData.into()),
    }
}

// Guard: read the TransferHookAccount extension and ensure transferring is set.
fn assert_is_transferring(account_info: &AccountInfo) -> Result<()> {
    let data = account_info.try_borrow_data()?;
    let state = StateWithExtensions::<Token2022Account>::unpack(&data)
        .map_err(|_| error!(HookError::BadAccount))?;
    let ext = state
        .get_extension::<TransferHookAccount>()
        .map_err(|_| error!(HookError::NotTransferring))?;
    if !bool::from(ext.transferring) {
        return Err(error!(HookError::NotTransferring));
    }
    Ok(())
}

#[derive(Accounts)]
pub struct TransferHook<'info> {
    pub source: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    pub destination: InterfaceAccount<'info, TokenAccount>,
    /// CHECK: validated against whitelist PDA seeds
    pub owner: AccountInfo<'info>,
    #[account(seeds = [b"wl", owner.key().as_ref()], bump)]
    pub whitelist: Account<'info, Whitelist>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[account]
pub struct Whitelist { pub allowed: bool }

#[error_code]
pub enum HookError {
    #[msg("not allowed")] NotAllowed,
    #[msg("bad whitelist")] BadWhitelist,
    #[msg("bad account")] BadAccount,
    #[msg("not transferring")] NotTransferring,
}
`;

export const SAMPLES: Sample[] = [
  {
    id: "vulnerable",
    label: "Vulnerable transfer hook",
    tag: "many findings",
    description:
      "A Token-2022 transfer hook that copies legacy SPL patterns: no transferring guard, in-hook CPI, unvalidated extra accounts, and fee/size footguns.",
    source: VULNERABLE,
  },
  {
    id: "secure",
    label: "Secure transfer hook",
    tag: "0 high/critical",
    description:
      "The same hook with audit-derived guards: transferring assertion, seed-validated whitelist, token_interface, and no same-mint re-entry.",
    source: SECURE,
  },
];

export const SAMPLE_BY_ID = Object.fromEntries(SAMPLES.map((s) => [s.id, s]));
