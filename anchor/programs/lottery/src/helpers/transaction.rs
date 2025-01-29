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

pub fn distribute_prizes<'info>(winners: &Vec<Ticket>, prize: u64, pool: &AccountInfo<'info>, system_program: &Program<'info, System>, rank: u8) -> Result<Vec<Winner>> {
    let mut winner_list: Vec<Winner> = Vec::new();
    let mut total_distributed = 0u64;
    let pool_balance = pool.lamports();

    for winner in winners {
        let winner_pubkey = winner.owner;
        
        // 실제 전송 가능한 금액 계산
        let transfer_amount = std::cmp::min(prize, pool_balance.saturating_sub(total_distributed));
        
        if transfer_amount > 0 {
            // Lamport 송금 로직
            invoke(
                &system_instruction::transfer(
                    pool.key,
                    &winner_pubkey,
                    transfer_amount
                ),
                &[
                    pool.to_account_info(),
                    system_program.to_account_info(),
                ],
            )?;

            total_distributed = total_distributed.checked_add(transfer_amount)
                .ok_or(error!(CustomError::Overflow))?;

            // 당첨자 정보 저장
            winner_list.push(Winner {
                user: winner_pubkey,
                prize: transfer_amount,
                rank,
            });
            msg!("Sent {} lamports to {:?} (Rank {})", transfer_amount, winner_pubkey, rank);
        }
    }
    Ok(winner_list)
}

pub fn distribute_prize_for_rank<'info>(
    winners: &mut Vec<Winner>,
    tickets: &Vec<Ticket>,
    total_prize: u64,
    pool: &AccountInfo<'info>,
    system_program: &Program<'info, System>,
    rank: u8,
) -> Result<()> {
    if !tickets.is_empty() {
        let prize_per_winner = total_prize.checked_div(tickets.len() as u64)
            .ok_or(error!(CustomError::Overflow))?;
        winners.extend(distribute_prizes(tickets, prize_per_winner, pool, system_program, rank)?);
    }
    Ok(())
}