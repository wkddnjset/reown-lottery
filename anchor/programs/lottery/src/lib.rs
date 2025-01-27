#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use std::collections::HashSet;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod lotto_program {
    use super::*;

    pub fn buy_ticket(ctx: Context<BuyTicket>, time_slot: String) -> Result<()> {
        let clock = Clock::get().unwrap();
        let now = clock.unix_timestamp;

        let lotto_account = &mut ctx.accounts.lotto_account;

        // 구매 시간 검증
        if !is_valid_time(now, &time_slot) {
            return Err(ErrorCode::InvalidPurchaseTime.into());
        }

        // 구매 제한 검증
        if lotto_account.purchased_addresses.contains(&ctx.accounts.buyer.key()) {
            return Err(ErrorCode::AlreadyPurchased.into());
        }

        // 로또 구매 등록
        lotto_account.purchased_addresses.push(ctx.accounts.buyer.key());
        lotto_account.total_pot += 1;

        Ok(())
    }

    pub fn pick_winner(ctx: Context<PickWinner>, time_slot: String) -> Result<()> {
        let clock = Clock::get().unwrap();
        let now = clock.unix_timestamp;

        // 당첨자 발표 시간 검증
        if !is_result_time(now, &time_slot) {
            return Err(ErrorCode::InvalidResultTime.into());
        }

        let lotto_account = &mut ctx.accounts.lotto_account;

        // 당첨자 선정
        let winner = pick_random_winner(&lotto_account.purchased_addresses)?;
        let prize_amount = (lotto_account.total_pot as f64 * 0.8) as u64;

        // 보상 전송
        **ctx.accounts.winner_wallet.try_borrow_mut_lamports()? += prize_amount;

        // 로또 초기화
        lotto_account.purchased_addresses.clear();
        lotto_account.total_pot = 0;

        Ok(())
    }
}

// Helper Functions
fn is_valid_time(now: i64, time_slot: &str) -> bool {
    // 타임슬롯에 따라 구매 가능 시간 검증
    let hour = (now % 86400) / 3600; // 하루의 초 기준으로 현재 시 계산
    let minute = (now % 3600) / 60;

    match time_slot {
        "A" => (hour == 0 && minute >= 5) || (hour >= 1 && hour < 12),
        "B" => (hour == 12 && minute >= 5) || (hour >= 13 && hour < 24),
        _ => false,
    }
}

fn is_result_time(now: i64, time_slot: &str) -> bool {
    // 타임슬롯에 따라 결과 발표 시간 검증
    let hour = (now % 86400) / 3600;
    let minute = (now % 3600) / 60;

    match time_slot {
        "A" => hour == 12 && minute == 0,
        "B" => hour == 0 && minute == 0,
        _ => false,
    }
}

fn pick_random_winner(addresses: &Vec<Pubkey>) -> Result<Pubkey> {
    if addresses.is_empty() {
        return Err(ErrorCode::NoParticipants.into());
    }
    let clock = Clock::get().unwrap();
    let winner_index = (clock.unix_timestamp as usize) % addresses.len();
    Ok(addresses[winner_index])
}



// Accounts
#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub lotto_account: Account<'info, LottoAccount>,
    #[account(mut)]
    pub buyer: Signer<'info>,
}

#[derive(Accounts)]
pub struct PickWinner<'info> {
    #[account(mut)]
    pub lotto_account: Account<'info, LottoAccount>,
    /// CHECK: This is safe because we ensure proper transfer
    #[account(mut)]
    pub winner_wallet: AccountInfo<'info>,
}

// State
#[account]
pub struct LottoAccount {
    pub purchased_addresses: Vec<Pubkey>,
    pub total_pot: u64,
}

// Errors
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid purchase time.")]
    InvalidPurchaseTime,
    #[msg("Invalid result time.")]
    InvalidResultTime,
    #[msg("This address has already purchased a ticket.")]
    AlreadyPurchased,
    #[msg("No participants in the lottery.")]
    NoParticipants,
}