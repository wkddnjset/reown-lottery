use anchor_lang::prelude::*;
use crate::{Lottery, Ticket, TICKET_PRICE};

pub fn add_tickets(
    lottery: &mut Account<Lottery>,
    ticket_numbers: Vec<[u8; 4]>,
    owner: Pubkey,
) -> Result<()> {
    let current_time = Clock::get()?.unix_timestamp;
    
    for numbers in &ticket_numbers {
        add_single_ticket(lottery, numbers, owner, current_time)?;
    }

    log_ticket_purchase(&ticket_numbers);
    Ok(())
}

pub fn add_single_ticket(
    lottery: &mut Account<Lottery>,
    numbers: &[u8; 4],
    owner: Pubkey,
    timestamp: i64,
) -> Result<()> {
    lottery.tickets.push(Ticket {
        owner,
        numbers: *numbers,
        timestamp,
    });
    Ok(())
}

pub fn log_ticket_purchase(ticket_numbers: &Vec<[u8; 4]>) {
    msg!(
        "{} tickets purchased for a total of {} lamports",
        ticket_numbers.len(),
        ticket_numbers.len() as u64 * TICKET_PRICE
    );
}