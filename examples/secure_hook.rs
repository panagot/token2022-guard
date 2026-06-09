use anchor_lang::prelude::*;
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
