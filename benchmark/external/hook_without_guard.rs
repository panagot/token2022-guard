// Pattern: transfer hook without transferring-state guard (audit-class bug)
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use spl_transfer_hook_interface::instruction::ExecuteInstruction;

#[program]
pub mod external_hook {
    use super::*;
    pub fn transfer_hook(ctx: Context<HookCtx>, _amount: u64) -> Result<()> {
        require!(ctx.accounts.policy.allowed, ErrorCode::Denied);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct HookCtx<'info> {
    pub source: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    pub policy: Account<'info, Policy>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[account]
pub struct Policy { pub allowed: bool }
