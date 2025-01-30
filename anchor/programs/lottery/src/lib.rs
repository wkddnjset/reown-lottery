use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, program::invoke_signed, system_instruction};
use oorandom::Rand32;
use std::collections::HashSet;
pub mod helpers;
use self::helpers::*;


declare_id!("4ytNhMnguDYzk4CR2FfnAnNrjC7bLTYaGrpPvZy8JPy8");

// 상수 정의
pub const TICKET_PRICE: u64 = 10_000_000; // 0.01 SOL
pub const BUFFER_TIME: i64 = 300; // 5분 (초 단위)
pub const MIN_NUMBER: u8 = 1;
pub const MAX_NUMBER: u8 = 30;
pub const NUMBERS_PER_TICKET: usize = 4;

// 수수료 비율 상수
pub const DEVELOPER_FEE_PERCENT: u64 = 5;
pub const FIRST_PRIZE_PERCENT: u64 = 75;
pub const SECOND_PRIZE_PERCENT: u64 = 20;
pub const THIRD_PRIZE_PERCENT: u64 = 5;

#[program]
pub mod lottery {
    use super::*;

    pub fn initialize_lottery(ctx: Context<InitializeLottery>, draw_time: i64) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        lottery.tickets = Vec::new();
        lottery.past_rounds = Vec::new();
        lottery.draw_time = draw_time;
        lottery.current_round = 1;
        let (pool_pda, bump) = Pubkey::find_program_address(&[b"lottery_pool"], ctx.program_id);
        lottery.pool = pool_pda;
        lottery.bump = bump;
        // lottery.pool = *ctx.accounts.pool.key; // 실제 풀 지갑 주소 직접 설정
        // lottery.bump = 0;
        lottery.dev = *ctx.accounts.dev.key;
        lottery.admin = *ctx.accounts.user.key; // 관리자 설정
        Ok(())
    }

    pub fn purchase_tickets(ctx: Context<Purchase>, ticket_numbers: Vec<[u8; 4]>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        validate_purchase_time(lottery.draw_time, Clock::get()?.unix_timestamp)?;
        validate_ticket_numbers(&ticket_numbers, ctx.accounts.user.key, &lottery.tickets)?;
        validate_dev_key(lottery.dev, ctx.accounts.dev.key())?;
        validate_pool_key(lottery.pool, ctx.accounts.pool.key())?;

        let ticket_count = ticket_numbers.len();
        let total_cost = ticket_count as u64 * TICKET_PRICE;
        let developer_fee = total_cost * DEVELOPER_FEE_PERCENT / 100;
        let net_pool_amount = total_cost.saturating_sub(developer_fee);

        transfer_sol(
            &ctx.accounts.user,
            &ctx.accounts.dev,
            &ctx.accounts.system_program,
            developer_fee,
        )?;

        transfer_sol(
            &ctx.accounts.user,
            &ctx.accounts.pool,
            &ctx.accounts.system_program,
            net_pool_amount,
        )?;
        
        add_tickets(lottery, ticket_numbers, *ctx.accounts.user.key)?;
        msg!("{} tickets purchased for a total of {} lamports", ticket_count, total_cost);
        Ok(())
    }

    pub fn pick_winners(ctx: Context<PickWinners>, next_draw_time: i64) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        let current_timestamp = Clock::get()?.unix_timestamp;
        let tickets_clone = lottery.tickets.clone();

        if tickets_clone.is_empty() {
            lottery.draw_time = current_timestamp + 1730; // 1730초 = 28분
            msg!("No tickets found. Draw time extended by 28 minutes.");
            return Ok(());
        }

        // 개발 테스트 환경에서 해당 validation 제외
        if next_draw_time <= current_timestamp {
            return Err(error!(CustomError::InvalidNextDrawTime));
        }

        let total_balance = ctx.accounts.pool.to_account_info().lamports();

        // ⬇️ 아직 claim하지 않은 상금 계산
        let mut unclaimed_prize = 0;
        for round in &lottery.past_rounds {
            for winner in &round.winner {
                if !winner.claimed {
                    unclaimed_prize += winner.prize;
                }
            }
        }
        
        let distributable_balance = total_balance.saturating_sub(unclaimed_prize);

        let first_prize = distributable_balance * FIRST_PRIZE_PERCENT / 100;
        let second_prize = distributable_balance * SECOND_PRIZE_PERCENT / 100;
        let third_prize = distributable_balance * THIRD_PRIZE_PERCENT / 100;
        // 1등 랜덤 선택
        let mut rng = oorandom::Rand32::new(current_timestamp as u64);
        let winning_index = rng.rand_range(0..tickets_clone.len() as u32) as usize;
        let first_winner_ticket = &tickets_clone[winning_index];

        let mut first_place: Vec<&Ticket> = Vec::new();
        let mut second_place: Vec<&Ticket> = Vec::new();
        let mut third_place: Vec<&Ticket> = Vec::new();

        for ticket in &tickets_clone {
            let match_count = count_matching_numbers(&first_winner_ticket.numbers, &ticket.numbers);
            if match_count == 4 {
                first_place.push(ticket); // ✅ 1등도 여러 명 가능하도록 변경
            } else if match_count == 3 {
                second_place.push(ticket);
            } else if match_count == 2 {
                third_place.push(ticket);
            }
        }

        // 당첨 정보 저장 (Claim 방식으로 변경)
        let mut winners = Vec::new();

        // ✅ 1등 (숫자 4개 일치)
        if !first_place.is_empty() {
            let first_prize_per_winner = first_prize / first_place.len() as u64;
            for winner in first_place {
                winners.push(Winner {
                    user: winner.owner,
                    prize: first_prize_per_winner,
                    rank: 1,
                    claimed: false,
                });
            }
        }

        // ✅ 2등 (숫자 3개 일치)
        if !second_place.is_empty() {
            let second_prize_per_winner = second_prize / second_place.len() as u64;
            for winner in second_place {
                winners.push(Winner {
                    user: winner.owner,
                    prize: second_prize_per_winner,
                    rank: 2,
                    claimed: false,
                });
            }
        }

        // ✅ 3등 (숫자 2개 일치)
        if !third_place.is_empty() {
            let third_prize_per_winner = third_prize / third_place.len() as u64;
            for winner in third_place {
                winners.push(Winner {
                    user: winner.owner,
                    prize: third_prize_per_winner,
                    rank: 3,
                    claimed: false,
                });
            }
        }

        let round_id = lottery.current_round;
        // PastRound 저장
        lottery.past_rounds.push(PastRound {
            round_id: round_id,
            winning_numbers: first_winner_ticket.numbers,
            user_tickets: tickets_clone,
            winner: winners,
        });

        // 티켓 초기화 및 다음 라운드 세팅
        lottery.tickets.clear();
        lottery.current_round = round_id + 1;
        lottery.draw_time = next_draw_time;

        Ok(())
    }

    pub fn claim_prize(ctx: Context<ClaimPrize>, round_id: u64, rank: u8) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        let user_key = *ctx.accounts.user.key;
        validate_pool_key(lottery.pool, ctx.accounts.pool.key())?;

        let pool_pda = lottery.pool;
        let bump = lottery.bump;

        // 해당 round_id의 당첨 정보 찾기
        let past_round = lottery.past_rounds.iter_mut().find(|r| r.round_id == round_id)
            .ok_or(error!(CustomError::DrawNotAllowed))?;

        if let Some(winner) = past_round.winner.iter_mut().find(|w| w.user == user_key && w.rank == rank) {
            if winner.claimed {
                return Err(error!(CustomError::AlreadyClaimed));
            }

            let signer_seeds: &[&[u8]] = &[b"lottery_pool", &[bump]];

            // 상금 지급 (PDA가 서명자로 작동)
            invoke_signed(
                &system_instruction::transfer(
                    &pool_pda,
                    &ctx.accounts.user.key(),
                    winner.prize,
                ),
                &[
                    ctx.accounts.pool.to_account_info(),
                    ctx.accounts.user.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
                &[signer_seeds], // PDA 서명 추가
            )?;
            // 청구 완료 상태로 변경
            winner.claimed = true;
            msg!("Claim successful: {} lamports sent to {:?} for round {}", winner.prize, user_key, round_id);
        } else {
            return Err(error!(CustomError::Unauthorized));
        }

        Ok(())
    }

}

#[derive(Accounts)]
pub struct InitializeLottery<'info> {
    #[account(init, payer = user, space = 8 + Lottery::LEN, seeds = [b"lottery", user.key().as_ref()], bump)]
    pub lottery: Account<'info, Lottery>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: This account is used as the lottery pool. The program assumes this is a valid system account.
    #[account(mut)]
    pub pool: AccountInfo<'info>,
    /// CHECK: This account is the developer's wallet. It is trusted to receive a portion of the prize pool.
    #[account(mut)]
    pub dev: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct Purchase<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: This is the lottery pool account used for distributing prizes.
    #[account(mut)]
    pub pool: AccountInfo<'info>,
    /// CHECK: This is the developer account used for receiving developer fee.
    #[account(mut)]
    pub dev: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PickWinners<'info> {
    #[account(
        mut,
        has_one = pool,
        has_one = dev,
        constraint = lottery.admin == user.key() @ CustomError::Unauthorized
    )]
    pub lottery: Account<'info, Lottery>,
    /// CHECK: This is the lottery pool account used for prize distribution.
    #[account(mut)]
    pub pool: AccountInfo<'info>,
    /// CHECK: This is the developer's wallet account.
    #[account(mut)]
    pub dev: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimPrize<'info> {
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
    /// CHECK: This is the lottery pool account used for prize distribution.
    #[account(mut)]
    pub pool: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Lottery {
    pub tickets: Vec<Ticket>,
    pub current_round: u64,
    pub draw_time: i64,
    pub past_rounds: Vec<PastRound>,
    pub pool: Pubkey,
    pub bump: u8,
    pub dev: Pubkey,
    pub admin: Pubkey,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Winner {
    pub user: Pubkey,
    pub prize: u64,
    pub rank: u8,
    pub claimed: bool, // 상금 청구 여부 추가
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct PastRound {
  pub round_id: u64,
  pub winner : Vec<Winner>,
  pub winning_numbers: [u8; 4],
  pub user_tickets: Vec<Ticket>,
}

impl Lottery {
  pub const LEN: usize = 8 + 4 + (8 + 4 * 1) * 100 + 32 + 32 + 32; // 티켓과 당첨 결과 예상 크기
}

#[account]
pub struct Ticket {
  pub owner: Pubkey,
  pub numbers: [u8; 4],
  pub timestamp: i64,
}

impl Ticket {
  pub const LEN: usize = 32 + 4 * 1 + 8; // Pubkey + numbers + timestamp
}

#[error_code]
pub enum CustomError {
  #[msg("Invalid number in the ticket.")]
  InvalidNumber,
  #[msg("Duplicate number found in the ticket.")]
  DuplicateNumber,
  #[msg("Ticket purchase is not allowed at this time.")]
  PurchaseNotAllowed,
  #[msg("Duplicate ticket is not allowed.")]
  DuplicateTicket,
  #[msg("Unauthorized access.")]
  Unauthorized, // 관리자 권한 에러
  #[msg("Draw is not allowed at this time.")]
  DrawNotAllowed,
  #[msg("Invalid next draw time.")]
  InvalidNextDrawTime,
  #[msg("Overflow error.")]
  Overflow,
  #[msg("Insufficient funds.")]
  InsufficientFunds,
  #[msg("Already claimed.")]
  AlreadyClaimed,
  #[msg("Invalid developer account.")]
  InvalidDevAccount,
  #[msg("Invalid pool account.")]
  InvalidPoolAccount,
  #[msg("No tickets found.")]
  NoTickets,
}
