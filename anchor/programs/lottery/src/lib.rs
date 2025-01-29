use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use oorandom::Rand32;
use std::collections::HashSet;
pub mod helpers;
use self::helpers::*;


declare_id!("Bx9VQTiKcL3bgY1cnKs4bMgs2xR6UG7fNtKciRTU1iQH");

// 상수 정의
pub const TICKET_PRICE: u64 = 10_000_000; // 0.01 SOL
pub const BUFFER_TIME: i64 = 1800; // 30분 (초 단위)
pub const MIN_NUMBER: u8 = 1;
pub const MAX_NUMBER: u8 = 30;
pub const NUMBERS_PER_TICKET: usize = 4;

// 수수료 비율 상수
pub const DEVELOPER_FEE_PERCENT: u64 = 10;
pub const FIRST_PRIZE_PERCENT: u64 = 60;
pub const SECOND_PRIZE_PERCENT: u64 = 20;
pub const THIRD_PRIZE_PERCENT: u64 = 10;

#[program]
pub mod lottery {
    use super::*;

    pub fn initialize_lottery(ctx: Context<InitializeLottery>, draw_time: i64) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        lottery.tickets = Vec::new();
        lottery.past_rounds = Vec::new();
        lottery.draw_time = draw_time;
        lottery.current_round = 1;
        lottery.pool = *ctx.accounts.pool.key;
        lottery.dev = *ctx.accounts.dev.key;
        lottery.admin = *ctx.accounts.user.key; // 관리자 설정
        Ok(())
    }

    pub fn purchase_tickets(ctx: Context<Purchase>, ticket_numbers: Vec<[u8; 4]>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        validate_purchase_time(lottery.draw_time, Clock::get()?.unix_timestamp)?;
        validate_ticket_numbers(&ticket_numbers, ctx.accounts.user.key, &lottery.tickets)?;

        let ticket_count = ticket_numbers.len();
        let total_cost = ticket_count as u64 * TICKET_PRICE;
        transfer_sol(
            &ctx.accounts.user,
            &ctx.accounts.pool,
            &ctx.accounts.system_program,
            total_cost,
        )?;
        
        add_tickets(lottery, ticket_numbers, *ctx.accounts.user.key)?;
        msg!("{} tickets purchased for a total of {} lamports", ticket_count, total_cost);
        Ok(())
    }

    pub fn draw_winners(ctx: Context<DrawWinners>, next_draw_time: i64) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        let current_timestamp = Clock::get()?.unix_timestamp;

        // 개발 테스트 과정에서 validation 제외하기
        // validate_draw_conditions(
        //     lottery.admin,
        //     *ctx.accounts.user.key,
        //     lottery.draw_time,
        //     current_timestamp
        // )?;

        // 다음 추첨 시간 유효성 검사 추가
        if next_draw_time <= current_timestamp + BUFFER_TIME {
            return Err(error!(CustomError::InvalidNextDrawTime));
        }

        let total_balance = ctx.accounts.pool.to_account_info().lamports();
        let reserve_amount = 10_000_000; // for gas fee

        // 분배 가능한 총 금액 계산 (총 잔액 - 예약 금액)
        let distributable_balance = total_balance.saturating_sub(reserve_amount);
        let developer_fee = distributable_balance / 10;

        let current_round = lottery.current_round;
        let tickets_clone = lottery.tickets.clone();

        // 당첨 번호 생성
        let winning_numbers = generate_winning_numbers()?;

        // 당첨자 분류
        let (first_place, second_place, third_place) = categorize_winners(&lottery.tickets, &winning_numbers);

        // 상금 분배 및 당첨자 정보 저장
        let mut winners = Vec::new();
        
        // 각 등수별 상금 분배
        distribute_prize_for_rank(
            &mut winners,
            &first_place,
            distributable_balance * FIRST_PRIZE_PERCENT / 100,
            &ctx.accounts.pool,
            &ctx.accounts.system_program,
            1,
        )?;

        distribute_prize_for_rank(
            &mut winners,
            &second_place,
            distributable_balance * SECOND_PRIZE_PERCENT / 100,
            &ctx.accounts.pool,
            &ctx.accounts.system_program,
            2,
        )?;

        distribute_prize_for_rank(
            &mut winners,
            &third_place,
            distributable_balance * THIRD_PRIZE_PERCENT / 100,
            &ctx.accounts.pool,
            &ctx.accounts.system_program,
            3,
        )?;

        // 개발자 수수료 송금
        **ctx.accounts.dev.to_account_info().try_borrow_mut_lamports()? += developer_fee;

        // 당첨 정보 저장
        lottery.past_rounds.push(PastRound {
            round_id: current_round,
            winning_numbers,
            user_tickets: tickets_clone,
            winner: winners,
        });

        // 다음 라운드 준비
        lottery.tickets.clear();
        lottery.current_round += 1;
        lottery.draw_time = next_draw_time;
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
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DrawWinners<'info> {
  #[account(
      mut,
      has_one = pool,
      has_one = dev,
      constraint = lottery.admin == user.key() @ CustomError::Unauthorized
  )]
  pub lottery: Account<'info, Lottery>,
  /// CHECK: This is the lottery pool account used for distributing prizes.
  #[account(
      mut,
      constraint = pool.data_is_empty() && pool.lamports() > 0
  )]
  pub pool: AccountInfo<'info>,
  /// CHECK: This is the developer's wallet account.
  #[account(mut)]
  pub dev: AccountInfo<'info>,
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
  pub dev: Pubkey,
  pub admin: Pubkey,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct Winner {
  pub user: Pubkey,
  pub prize: u64,
  pub rank: u8,
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
}
