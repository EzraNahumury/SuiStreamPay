# StreamPay Smart Contract (Sui Move)

This smart contract manages a streaming-based payment system for paid content access. Readers pay per 10 seconds (rate_per_10s) from a deposit balance, and funds are transferred to the creator incrementally via checkpoints. If the balance runs out, the session is automatically paused and can be resumed with a top up.

## What this smart contract does
- Admin creates the platform and sets the listing fee.
- Creators publish paid content and receive a vault to collect earnings.
- Readers start a session with a deposit, checkpoint to pay for time used, top up when the balance is low, and end the session to refund the remaining balance.

## Core data structures
- Platform: global configuration + listing fee balance.
  - admin, listing_fee, fee_balance, contents, vaults (mapping creator -> vault_id)
- Content: content metadata + rate.
  - creator, title, description, pdf_uri, rate_per_10s, created_at_ms, vault_id
- CreatorVault: creator earnings holder.
  - creator, balance
- Session: reader-owned streaming status.
  - content_id, vault_id, user, rate_per_10s, deposit_balance, start_time_ms, last_checkpoint_ms, status, total_spent, total_streamed_ms

## Session status
- 1 (ACTIVE): session is running, payments can be settled.
- 2 (PAUSED): balance is empty, needs top up.
- 3 (ENDED): session is finished and cannot be used again.

## Main functions by role
Admin:
- init_platform(listing_fee)
- set_listing_fee(new_fee)
- withdraw_platform_fees(amount)

Creator:
- create_content(title, description, pdf_uri, rate_per_10s, listing_fee_coin, clock)
- update_rate(new_rate)
- withdraw_creator(amount)

Reader:
- start_session(content, vault, deposit, clock)
- checkpoint(session, vault, clock)
- top_up(session, deposit, clock)
- end_session(session, vault, clock)

View:
- platform_fee_balance(platform)
- creator_vault_balance(vault)
- session_balance(session)
- session_status(session)

## Smart contract flow
1) Admin deploys and initializes the platform with a listing fee.
2) Creator publishes content (pays listing fee if non-zero). If they do not have a vault yet, it is created automatically.
3) Reader starts a session with a deposit.
4) While reading, the reader calls checkpoint to pay for elapsed time.
5) If the balance runs out, the session automatically becomes PAUSED. The reader tops up to continue.
6) Reader ends the session to refund the remaining balance.
7) Creator can withdraw funds from the vault at any time.

## Basic commands (Sui CLI)
Initialize project:
```bash
sui move new
```

Build:
```bash
sui client build
```

Publish:
```bash
sui move publish
```

Init platform (replace package ID with your published ID):
```bash
sui client call --package 0xad560e454d718b8a1c00a8661ee00b56a87dc55a10a6f38e6a30cc76ef27d9c2 --module streampay_sc --function init_platform --args 10000000 --gas-budget 100000000
```
