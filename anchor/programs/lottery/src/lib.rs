use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use oorandom::Rand32;
use std::collections::HashSet;

declare_id!("2THy5cGocSyxCfV2dBbXLg8CcSUYBFJ4fkDnTyiVWeB4");

#[program]
pub mod lottery {
    use super::*;

    pub fn initialize_lottery(ctx: Context<InitializeLottery>, draw_time: i64) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        lottery.tickets = Vec::new();
        lottery.past_draws = Vec::new();
        lottery.draw_time = draw_time;
        lottery.pool = *ctx.accounts.pool.key;
        lottery.dev = *ctx.accounts.dev.key;
        lottery.admin = *ctx.accounts.user.key; // 관리자 설정
        Ok(())
    }

    pub fn purchase_tickets(ctx: Context<Purchase>, ticket_numbers: Vec<[u8; 4]>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        let current_time = Clock::get()?.unix_timestamp;
        let draw_time = lottery.draw_time;
        let buffer_time = 30 * 60; // 30분

        require!(
            !(draw_time - buffer_time <= current_time && current_time <= draw_time + buffer_time),
            CustomError::PurchaseNotAllowed
        );

        let ticket_price: u64 = 10_000_000; // 0.01 SOL
        let total_cost = ticket_numbers.len() as u64 * ticket_price;

        // 중복 티켓 방지를 위해 기존 티켓 리스트를 Set으로 변환
        let existing_tickets: HashSet<[u8; 4]> = lottery.tickets.iter().map(|t| t.numbers).collect();

        for numbers in ticket_numbers.iter() {
            // 숫자 검증
            for &num in numbers.iter() {
                require!(num >= 1 && num <= 30, CustomError::InvalidNumber);
            }

            let unique_numbers: HashSet<u8> = numbers.iter().cloned().collect();
            require!(unique_numbers.len() == 4, CustomError::DuplicateNumber);

            // 중복 티켓 검증
            require!(!existing_tickets.contains(numbers), CustomError::DuplicateTicket);
        }

        // SOL 전송 (유저 -> pool)
        invoke(
            &system_instruction::transfer(
                &ctx.accounts.user.key(),
                &ctx.accounts.pool.key(),
                total_cost,
            ),
            &[
                ctx.accounts.user.to_account_info().clone(),
                ctx.accounts.pool.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
        )?;

        // 검증 통과 후 티켓 추가
        for numbers in &ticket_numbers {
            let new_ticket = Ticket {
                owner: *ctx.accounts.user.key,
                numbers: *numbers,
                timestamp: current_time,
            };
            lottery.tickets.push(new_ticket);
        }

        msg!("{} tickets purchased for a total of {} lamports", ticket_numbers.len(), total_cost);
        Ok(())
    }

    pub fn draw_winners(ctx: Context<DrawWinners>) -> Result<()> {
        let lottery = &mut ctx.accounts.lottery;
        require_eq!(
            lottery.admin,
            *ctx.accounts.user.key,
            CustomError::Unauthorized
        );
        let total_balance = ctx.accounts.pool.to_account_info().lamports();
        let developer_fee = total_balance / 10;

        // 난수 생성
        let seed = Clock::get()?.unix_timestamp as u64;
        let mut rng = Rand32::new(seed);
        let mut winning_numbers = [0u8; 4];
        for i in 0..4 {
            // 명시적으로 u32 범위를 제공
            winning_numbers[i] = rng.rand_range(1u32..31u32) as u8;
        }

        // 당첨자 분배
        let mut first_place = Vec::new();
        let mut second_place = Vec::new();
        let mut third_place = Vec::new();

        for ticket in lottery.tickets.iter() {
            let match_count = ticket
                .numbers
                .iter()
                .filter(|&num| winning_numbers.contains(num))
                .count();

            match match_count {
                4 => first_place.push(ticket.clone()),
                3 => second_place.push(ticket.clone()),
                2 => third_place.push(ticket.clone()),
                _ => {}
            }
        }

        // 상금 계산 및 분배
        let first_prize = if first_place.len() > 0 {
            total_balance * 6 / 10 / first_place.len() as u64
        } else { 0 };
        let second_prize = if second_place.len() > 0 {
            total_balance * 2 / 10 / second_place.len() as u64
        } else { 0 };
        let third_prize = if third_place.len() > 0 {
            total_balance / 10 / third_place.len() as u64
        } else { 0 };

        distribute_prizes(&first_place, first_prize, ctx.accounts.pool.to_account_info())?;
        distribute_prizes(&second_place, second_prize, ctx.accounts.pool.to_account_info())?;
        distribute_prizes(&third_place, third_prize, ctx.accounts.pool.to_account_info())?;

        // 개발자 수수료 송금
        **ctx.accounts.dev.to_account_info().try_borrow_mut_lamports()? += developer_fee;

        // 당첨 번호 저장
        lottery.past_draws.push(DrawResult {
            draw_time: Clock::get()?.unix_timestamp,
            winning_numbers,
        });

        // 티켓 초기화
        lottery.tickets.clear();

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
    #[account(mut)]
    pub lottery: Account<'info, Lottery>,
    /// CHECK: This is the lottery pool account used for distributing prizes.
    #[account(mut)]
    pub pool: AccountInfo<'info>,
    /// CHECK: This is the developer's wallet account.
    #[account(mut)]
    pub dev: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct Lottery {
    pub tickets: Vec<Ticket>,
    pub draw_time: i64,
    pub past_draws: Vec<DrawResult>,
    pub pool: Pubkey,
    pub dev: Pubkey,
    pub admin: Pubkey,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct DrawResult {
    pub draw_time: i64,
    pub winning_numbers: [u8; 4],
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

fn distribute_prizes(winners: &Vec<Ticket>, prize: u64, pool: AccountInfo) -> Result<()> {
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
        msg!("Sent {} lamports to {:?}", prize, winner_pubkey);
    }
    Ok(())
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
}
