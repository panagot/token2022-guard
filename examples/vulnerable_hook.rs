use anchor_lang::prelude::*;
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
