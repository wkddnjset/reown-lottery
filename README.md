# Reown 12'Lottery

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Anchor](https://img.shields.io/badge/Anchor-0.28.0-blue)](https://www.anchor-lang.com/)
[![Reown AppKit](https://img.shields.io/badge/Reown_AppKit-latest-green)](https://github.com/your-repo/reown-appkit)

</div>

A decentralized lottery dApp that randomly selects winners every 12 hours (currently operating at 1-hour intervals for testing)

WEBSITE : https://reown-lottery.vercel.app/

## 📚 Overview

This project is a lottery dApp implemented on the Solana blockchain using Reown AppKit. It is built with the Anchor framework, and the frontend is developed using Next.js and React.

## 🎯 Prize Distribution Structure

From the total prize pool (excluding unclaimed prizes):

- 1st Place: 75%
- 2nd Place: 20%
- 3rd Place: 5%

## 🔍 Core Features

### Ticket Purchase (purchase_tickets)

- Ticket price: 0.01 SOL
- 95% of purchase amount goes to prize pool
- 5% of purchase amount goes to developer wallet
- Duplicate purchases of the same number not allowed

### Winner Selection (pick_winners)

- Random selection from all tickets
- 1st place winner is mandatory
- 2nd and 3rd places are optional (prizes roll over if not selected)
- Next round start time can be configured
- Multiple wins possible for a single user

### Prize Claiming (claim_prize)

- Claim prizes using previous round information after round ends
- All ticket information is deleted when round ends

## ⚙️ Admin Features

- Initial setup required (initialize)
  - Prize pool account setup
  - Developer account registration
  - Admin address registration
- Admin page access restricted to designated wallet addresses
- Holds pick_winner authority

## 🤖 Automation System

- API-based winner selection automation
  - Cron job runs every 30 minutes
  - x-api-key based security implementation

## 🛠 Technologies Used

- [Anchor](https://www.anchor-lang.com/) - Solana smart contract framework
- [Reown AppKit](https://github.com/your-repo/reown-appkit) - Solana dApp development kit
- [Next.js](https://nextjs.org/) - React framework
- [React Query](https://tanstack.com/query/latest) - Server state management

## 💻 Installation

```bash
git clone https://github.com/wkddnjset/reown-lottery
cd reown-lottery
pnpm install
```

## ⚙️ Environment Setup

Set the following environment variables in your `.env` file:

```
NEXT_PUBLIC_PROJECT_ID=
NEXT_PUBLIC_LOTTERY_POOL_ADDRESS=
NEXT_PUBLIC_LOTTERY_DEV_ADDRESS=
NEXT_PUBLIC_LOTTERY_ADMIN_ADDRESS=
NEXT_PUBLIC_ADMIN_ADDRESS=

LOTTERY_ADMIN_PRIVATE_KEY=
X_API_KEY=

RESET_LOTTERY_TIME=
```
