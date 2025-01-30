use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use crate::{Ticket, Winner, CustomError};


pub fn transfer_sol<'info>(
    from: &Signer<'info>,
    to: &AccountInfo<'info>,
    system_program: &Program<'info, System>,
    amount: u64,
) -> Result<()> {
    invoke(
        &system_instruction::transfer(&from.key(), &to.key(), amount),
        &[
            from.to_account_info(),
            to.to_account_info(),
            system_program.to_account_info(),
        ],
    )?;
    Ok(())
}