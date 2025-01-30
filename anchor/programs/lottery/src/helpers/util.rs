use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use oorandom::Rand32;
use crate::{Ticket};

pub fn generate_winning_numbers() -> Result<[u8; 4]> {
    let seed = Clock::get()?.unix_timestamp as u64;
    let mut rng = Rand32::new(seed);
    let mut winning_numbers = [0u8; 4];
    for i in 0..4 {
        winning_numbers[i] = rng.rand_range(1u32..31u32) as u8;
    }
    Ok(winning_numbers)
}

pub fn categorize_winners(tickets: &Vec<Ticket>, winning_numbers: &[u8; 4]) -> (Vec<Ticket>, Vec<Ticket>, Vec<Ticket>) {
    let mut first_place = Vec::new();
    let mut second_place = Vec::new();
    let mut third_place = Vec::new();

    for ticket in tickets {
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

    (first_place, second_place, third_place)
}

pub fn count_matching_numbers(winning_numbers: &[u8; 4], ticket_numbers: &[u8; 4]) -> u8 {
    let winning_set: std::collections::HashSet<u8> = winning_numbers.iter().cloned().collect();
    ticket_numbers.iter().filter(|&&num| winning_set.contains(&num)).count() as u8
}