use anchor_lang::prelude::*;
use std::collections::HashSet;
use crate::{Ticket, CustomError};
use crate::{BUFFER_TIME, MIN_NUMBER, MAX_NUMBER, NUMBERS_PER_TICKET};

pub fn validate_purchase_time(draw_time: i64, current_time: i64) -> Result<()> {
    require!(
        !(draw_time - BUFFER_TIME <= current_time && current_time <= draw_time + BUFFER_TIME),
        CustomError::PurchaseNotAllowed
    );
    Ok(())
}

pub fn validate_ticket_numbers(
    ticket_numbers: &Vec<[u8; 4]>,
    user_key: &Pubkey,
    existing_tickets: &Vec<Ticket>,
) -> Result<()> {
    let existing_tickets: HashSet<[u8; 4]> = existing_tickets
        .iter()
        .filter(|t| t.owner == *user_key)
        .map(|t| t.numbers)
        .collect();

    for numbers in ticket_numbers {
        validate_number_range(numbers)?;
        validate_unique_numbers(numbers)?;
        validate_duplicate_ticket(numbers, &existing_tickets)?;
    }
    Ok(())
}

pub fn validate_number_range(numbers: &[u8; 4]) -> Result<()> {
    for &num in numbers.iter() {
        require!(
            num >= MIN_NUMBER && num <= MAX_NUMBER,
            CustomError::InvalidNumber
        );
    }
    Ok(())
}

pub fn validate_unique_numbers(numbers: &[u8; 4]) -> Result<()> {
    let unique_numbers: HashSet<u8> = numbers.iter().cloned().collect();
    require!(
        unique_numbers.len() == NUMBERS_PER_TICKET,
        CustomError::DuplicateNumber
    );
    Ok(())
}

pub fn validate_duplicate_ticket(numbers: &[u8; 4], existing_tickets: &HashSet<[u8; 4]>) -> Result<()> {
    require!(!existing_tickets.contains(numbers), CustomError::DuplicateTicket);
    Ok(())
}

pub fn validate_draw_conditions(
    admin: Pubkey,
    user_key: Pubkey,
    draw_time: i64,
    current_time: i64,
) -> Result<()> {
    // 관리자 권한 확인
    require_eq!(
        admin,
        user_key,
        CustomError::Unauthorized
    );

    // 추첨 시간 확인
    require!(
        current_time >= draw_time,
        CustomError::DrawNotAllowed
    );

    Ok(())
}