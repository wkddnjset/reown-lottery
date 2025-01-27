#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod test {
    use super::*;

  pub fn close(_ctx: Context<CloseTest>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.test.count = ctx.accounts.test.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.test.count = ctx.accounts.test.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeTest>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.test.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeTest<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Test::INIT_SPACE,
  payer = payer
  )]
  pub test: Account<'info, Test>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseTest<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub test: Account<'info, Test>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub test: Account<'info, Test>,
}

#[account]
#[derive(InitSpace)]
pub struct Test {
  count: u8,
}
