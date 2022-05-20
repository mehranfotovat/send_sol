use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod send_sol {
    use anchor_lang::solana_program::entrypoint::ProgramResult;

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        let pda_account = &mut *ctx.accounts.pda_account;
        pda_account.bump = *ctx.bumps.get("pda_account").unwrap();
        Ok(())
    }

    pub fn send_solana(ctx: Context<SendSol>) -> ProgramResult {
        let pda = ctx.accounts.pda_account.to_account_info();
        let to = ctx.accounts.to.to_account_info();

        **pda.try_borrow_mut_lamports()? -= 2_000_000_000;
        **to.try_borrow_mut_lamports()? += 2_000_000_000;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = 500,
        seeds = [b"pda-account"], bump,
    )]
    pub pda_account: Account<'info, PdaAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendSol<'info>{
    /// CHECK: we arent using it so its safe
    #[account(mut)]
    to: AccountInfo<'info>,
    // to: SystemAccount<'info>,
    #[account(mut)]
    pda_account: Account<'info, PdaAccount>,
    system_program: Program<'info, System>
}

#[account]
pub struct PdaAccount {
    bump: u8,
}