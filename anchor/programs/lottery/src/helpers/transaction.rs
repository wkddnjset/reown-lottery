use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use crate::{Ticket, Winner};

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

pub fn distribute_prizes(winners: &Vec<Ticket>, prize: u64, pool: AccountInfo, rank: u8) -> Result<Vec<Winner>> {
  let mut winner_list: Vec<Winner> = Vec::new();

  for winner in winners {
      // Lamport 송금 로직
      let winner_pubkey = winner.owner;
      invoke(
          &system_instruction::transfer(
              &pool.key, // 상금풀 지갑 주소
              &winner_pubkey,    // 당첨자 지갑 주소
              prize,             // 분배 금액
          ),
          &[pool.clone()],
      )?;

      // 당첨자 정보 저장
      winner_list.push(Winner {
          user: winner_pubkey,
          prize,
          rank,
      });
      msg!("Sent {} lamports to {:?} (Rank {})", prize, winner_pubkey, rank);
  }
  Ok(winner_list)
}

pub fn distribute_prize_for_rank(
    winners: &mut Vec<Winner>,
    tickets: &Vec<Ticket>,
    total_prize: u64,
    pool: AccountInfo,
    rank: u8,
) -> Result<()> {
    if !tickets.is_empty() {
        let prize_per_winner = total_prize / tickets.len() as u64;
        winners.extend(distribute_prizes(tickets, prize_per_winner, pool, rank)?);
    }
    Ok(())
}