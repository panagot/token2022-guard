use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
use spl_token_2022::extension::{ExtensionType, GroupPointer, MemberPointer, MetadataPointer};

declare_id!("Ext111111111111111111111111111111111111111");

#[program]
pub mod extensions_vault {
    use super::*;

    /// Initialize a Token-2022 mint with pointer extensions — no cross-validation.
    pub fn init_mint(ctx: Context<InitMint>) -> Result<()> {
        let _gp = ExtensionType::GroupPointer;
        let group = group_pointer;
        let _mp = ExtensionType::MemberPointer;
        let member = member_pointer;

        let _md = ExtensionType::MetadataPointer;
        let meta = metadata_pointer;

        let _scaled = ExtensionType::ScaledUiAmount;
        msg!("init {:?}", (group, member, meta));
        Ok(())
    }

    /// Swap against a fee + pausable mint — no epoch or pause guards.
    pub fn swap(ctx: Context<Swap>, amount: u64) -> Result<()> {
        // TransferFeeConfig on the mint; fee rate changes per epoch.
        let _fee_cfg = TransferFeeConfig {
            transfer_fee_basis_points: 50,
            maximum_fee: 1_000,
        };

        // Pausable extension enabled on this mint.
        let _pausable = ExtensionType::Pausable;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_ata.to_account_info(),
                    to: ctx.accounts.pool.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        // ScaledUiAmount: pricing uses raw amount.
        let quote = ctx.accounts.user_ata.amount;
        msg!("quote {}", quote);
        Ok(())
    }

    /// Set mint authority after an external CPI — cached field used blindly.
    pub fn configure(ctx: Context<Configure>) -> Result<()> {
        invoke(
            &spl_token::instruction::set_authority(
                ctx.accounts.token_program.key,
                ctx.accounts.mint.key,
                None,
                spl_token::instruction::AuthorityType::MintTokens,
                ctx.accounts.admin.key,
                &[],
            )?,
            &[
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.admin.to_account_info(),
            ],
        )?;
        let auth = ctx.accounts.mint.mint_authority;
        msg!("authority {:?}", auth);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitMint<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    pub mint: Account<'info, Mint>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub pool: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Configure<'info> {
    pub admin: Signer<'info>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

/// Stand-in for spl transfer-fee config (pattern trigger for T22-021).
struct TransferFeeConfig {
    transfer_fee_basis_points: u16,
    maximum_fee: u64,
}
