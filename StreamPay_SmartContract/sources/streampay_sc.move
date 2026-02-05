module streampay_sc::streampay_sc {
    use std::string::String;

    use sui::balance;
    use sui::balance::Balance;
    use sui::clock;
    use sui::clock::Clock;
    use sui::coin;
    use sui::coin::Coin;
    use sui::event;
    use sui::object;
    use sui::object::{ID, UID};
    use sui::sui::SUI;
    use sui::table;
    use sui::table::Table;
    use sui::transfer;
    use sui::tx_context;
    use sui::tx_context::TxContext;

    const E_NOT_ADMIN: u64 = 0;
    const E_NOT_CREATOR: u64 = 1;
    const E_NOT_OWNER: u64 = 2;
    const E_INACTIVE: u64 = 3;
    const E_INVALID_VAULT: u64 = 4;
    const E_INVALID_AMOUNT: u64 = 5;
    const E_ZERO_RATE: u64 = 6;
    const E_INVALID_TIME: u64 = 7;

    const STATUS_ACTIVE: u8 = 1;
    const STATUS_PAUSED: u8 = 2;
    const STATUS_ENDED: u8 = 3;

    const MILLIS_PER_10S: u64 = 10_000;

    /// Shared platform config + listing fee accumulator.
    public struct Platform has key, store {
        id: UID,
        admin: address,
        listing_fee: u64,
        fee_balance: Balance<SUI>,
        contents: vector<ID>,
        vaults: Table<address, ID>,
    }

    /// Shared content metadata.
    public struct Content has key, store {
        id: UID,
        creator: address,
        title: String,
        description: String,
        pdf_uri: String,
        rate_per_10s: u64,
        created_at_ms: u64,
        vault_id: ID,
    }

    /// Shared vault that accumulates creator earnings.
    public struct CreatorVault has key, store {
        id: UID,
        creator: address,
        balance: Balance<SUI>,
    }

    /// Owned by the reader. Tracks deposit and streaming state.
    public struct Session has key, store {
        id: UID,
        content_id: ID,
        vault_id: ID,
        user: address,
        rate_per_10s: u64,
        deposit_balance: Balance<SUI>,
        start_time_ms: u64,
        last_checkpoint_ms: u64,
        status: u8,
        total_spent: u64,
        total_streamed_ms: u64,
    }

    public struct ContentCreated has copy, drop {
        content_id: ID,
        creator: address,
        vault_id: ID,
        rate_per_10s: u64,
    }

    public struct ListingFeePaid has copy, drop {
        content_id: ID,
        amount: u64,
    }

    public struct SessionStarted has copy, drop {
        session_id: ID,
        content_id: ID,
        user: address,
        deposit: u64,
    }

    public struct TopUp has copy, drop {
        session_id: ID,
        amount: u64,
        new_balance: u64,
    }

    public struct CheckpointSettled has copy, drop {
        session_id: ID,
        elapsed_ms: u64,
        paid: u64,
        remaining: u64,
    }

    public struct SessionEnded has copy, drop {
        session_id: ID,
        refund: u64,
        total_spent: u64,
    }

    public struct Withdrawn has copy, drop {
        vault_id: ID,
        amount: u64,
    }

    public struct PlatformWithdrawn has copy, drop {
        amount: u64,
    }

    public struct CreatorVaultCreated has copy, drop {
        creator: address,
        vault_id: ID,
    }

    // -----------------------------
    // Init + Admin
    // -----------------------------

    public entry fun init_platform(listing_fee: u64, ctx: &mut TxContext) {
        let admin = tx_context::sender(ctx);
        let platform = Platform {
            id: object::new(ctx),
            admin,
            listing_fee,
            fee_balance: balance::zero<SUI>(),
            contents: vector::empty<ID>(),
            vaults: table::new(ctx),
        };
        transfer::share_object(platform);
    }

    public entry fun set_listing_fee(platform: &mut Platform, new_fee: u64, ctx: &mut TxContext) {
        assert!(tx_context::sender(ctx) == platform.admin, E_NOT_ADMIN);
        platform.listing_fee = new_fee;
    }

    public entry fun withdraw_platform_fees(
        platform: &mut Platform,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == platform.admin, E_NOT_ADMIN);
        let available = balance::value(&platform.fee_balance);
        let to_withdraw = if (amount == 0) { available } else { amount };
        assert!(to_withdraw <= available, E_INVALID_AMOUNT);
        if (to_withdraw > 0) {
            let payout = balance::split(&mut platform.fee_balance, to_withdraw);
            let coin = coin::from_balance(payout, ctx);
            transfer::public_transfer(coin, platform.admin);
            event::emit(PlatformWithdrawn { amount: to_withdraw });
        };
    }

    // -----------------------------
    // Creator
    // -----------------------------

    public entry fun create_content(
        platform: &mut Platform,
        title: String,
        description: String,
        pdf_uri: String,
        rate_per_10s: u64,
        mut listing_fee: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(rate_per_10s > 0, E_ZERO_RATE);

        let required_fee = platform.listing_fee;
        if (required_fee == 0) {
            // No listing fee; refund any coin passed in.
            transfer::public_transfer(listing_fee, sender);
        } else {
            let paid_value = coin::value(&listing_fee);
            assert!(paid_value >= required_fee, E_INVALID_AMOUNT);

            let fee_coin = if (paid_value > required_fee) {
                let fee_part = coin::split(&mut listing_fee, required_fee, ctx);
                transfer::public_transfer(listing_fee, sender);
                fee_part
            } else {
                listing_fee
            };
            balance::join(&mut platform.fee_balance, coin::into_balance(fee_coin));
        };

        let vault_id = if (table::contains(&platform.vaults, sender)) {
            *table::borrow(&platform.vaults, sender)
        } else {
            let vault = CreatorVault {
                id: object::new(ctx),
                creator: sender,
                balance: balance::zero<SUI>(),
            };
            let new_vault_id = object::id(&vault);
            transfer::share_object(vault);
            table::add(&mut platform.vaults, sender, new_vault_id);
            event::emit(CreatorVaultCreated { creator: sender, vault_id: new_vault_id });
            new_vault_id
        };

        let content = Content {
            id: object::new(ctx),
            creator: sender,
            title,
            description,
            pdf_uri,
            rate_per_10s,
            created_at_ms: clock::timestamp_ms(clock),
            vault_id,
        };
        let content_id = object::id(&content);
        vector::push_back(&mut platform.contents, content_id);
        transfer::share_object(content);

        event::emit(ContentCreated {
            content_id,
            creator: sender,
            vault_id,
            rate_per_10s,
        });
        if (required_fee > 0) {
            event::emit(ListingFeePaid { content_id, amount: required_fee });
        };
    }

    public entry fun update_rate(content: &mut Content, new_rate: u64, ctx: &mut TxContext) {
        assert!(tx_context::sender(ctx) == content.creator, E_NOT_CREATOR);
        assert!(new_rate > 0, E_ZERO_RATE);
        content.rate_per_10s = new_rate;
    }

    public entry fun withdraw_creator(
        vault: &mut CreatorVault,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == vault.creator, E_NOT_CREATOR);
        let available = balance::value(&vault.balance);
        let to_withdraw = if (amount == 0) { available } else { amount };
        assert!(to_withdraw <= available, E_INVALID_AMOUNT);
        if (to_withdraw > 0) {
            let payout = balance::split(&mut vault.balance, to_withdraw);
            let coin = coin::from_balance(payout, ctx);
            transfer::public_transfer(coin, vault.creator);
            event::emit(Withdrawn { vault_id: object::id(vault), amount: to_withdraw });
        };
    }

    // -----------------------------
    // Reader / Sessions
    // -----------------------------

    public entry fun start_session(
        content: &Content,
        vault: &CreatorVault,
        deposit: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let deposit_value = coin::value(&deposit);
        assert!(deposit_value > 0, E_INVALID_AMOUNT);
        assert!(object::id(vault) == content.vault_id, E_INVALID_VAULT);

        let now = clock::timestamp_ms(clock);
        let session = Session {
            id: object::new(ctx),
            content_id: object::id(content),
            vault_id: content.vault_id,
            user: sender,
            rate_per_10s: content.rate_per_10s,
            deposit_balance: coin::into_balance(deposit),
            start_time_ms: now,
            last_checkpoint_ms: now,
            status: STATUS_ACTIVE,
            total_spent: 0,
            total_streamed_ms: 0,
        };
        let session_id = object::id(&session);
        transfer::public_transfer(session, sender);
        event::emit(SessionStarted {
            session_id,
            content_id: object::id(content),
            user: sender,
            deposit: deposit_value,
        });
    }

    public entry fun top_up(
        session: &mut Session,
        deposit: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == session.user, E_NOT_OWNER);
        assert!(session.status != STATUS_ENDED, E_INACTIVE);
        let amount = coin::value(&deposit);
        assert!(amount > 0, E_INVALID_AMOUNT);

        balance::join(&mut session.deposit_balance, coin::into_balance(deposit));
        if (session.status == STATUS_PAUSED) {
            session.status = STATUS_ACTIVE;
            session.last_checkpoint_ms = clock::timestamp_ms(clock);
        };
        let new_balance = balance::value(&session.deposit_balance);
        event::emit(TopUp { session_id: object::id(session), amount, new_balance });
    }

    public entry fun checkpoint(
        session: &mut Session,
        vault: &mut CreatorVault,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == session.user, E_NOT_OWNER);
        assert!(session.status == STATUS_ACTIVE, E_INACTIVE);
        assert!(object::id(vault) == session.vault_id, E_INVALID_VAULT);

        let (paid, elapsed_ms) = settle_internal(session, vault, clock, ctx);
        if (paid > 0) {
            let remaining = balance::value(&session.deposit_balance);
            event::emit(CheckpointSettled {
                session_id: object::id(session),
                elapsed_ms,
                paid,
                remaining,
            });
        };
    }

    public entry fun end_session(
        session: &mut Session,
        vault: &mut CreatorVault,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == session.user, E_NOT_OWNER);
        assert!(session.status != STATUS_ENDED, E_INACTIVE);
        assert!(object::id(vault) == session.vault_id, E_INVALID_VAULT);

        if (session.status == STATUS_ACTIVE) {
            let (_paid, _elapsed) = settle_internal(session, vault, clock, ctx);
        };

        session.status = STATUS_ENDED;
        let remaining = balance::value(&session.deposit_balance);
        if (remaining > 0) {
            let refund = balance::split(&mut session.deposit_balance, remaining);
            let coin = coin::from_balance(refund, ctx);
            transfer::public_transfer(coin, session.user);
        };
        event::emit(SessionEnded {
            session_id: object::id(session),
            refund: remaining,
            total_spent: session.total_spent,
        });
    }

    // -----------------------------
    // Views
    // -----------------------------

    public fun platform_fee_balance(platform: &Platform): u64 {
        balance::value(&platform.fee_balance)
    }

    public fun creator_vault_balance(vault: &CreatorVault): u64 {
        balance::value(&vault.balance)
    }

    public fun session_balance(session: &Session): u64 {
        balance::value(&session.deposit_balance)
    }

    public fun session_status(session: &Session): u8 {
        session.status
    }

    // -----------------------------
    // Internal helpers
    // -----------------------------

    fun settle_internal(
        session: &mut Session,
        vault: &mut CreatorVault,
        clock: &Clock,
        ctx: &mut TxContext
    ): (u64, u64) {
        let now = clock::timestamp_ms(clock);
        let last = session.last_checkpoint_ms;
        assert!(now >= last, E_INVALID_TIME);

        let elapsed_ms = now - last;
        if (elapsed_ms == 0) {
            return (0, 0);
        };

        let fee = calc_fee(elapsed_ms, session.rate_per_10s);
        if (fee == 0) {
            return (0, 0);
        };

        let available = balance::value(&session.deposit_balance);
        let to_pay = if (fee > available) { available } else { fee };

        if (to_pay > 0) {
            let payment = balance::split(&mut session.deposit_balance, to_pay);
            let coin = coin::from_balance(payment, ctx);
            transfer::public_transfer(coin, vault.creator);
            session.total_spent = session.total_spent + to_pay;
            session.total_streamed_ms = session.total_streamed_ms + elapsed_ms;
            session.last_checkpoint_ms = now;
            if (balance::value(&session.deposit_balance) == 0) {
                session.status = STATUS_PAUSED;
            };
        };
        (to_pay, elapsed_ms)
    }

    fun calc_fee(elapsed_ms: u64, rate_per_10s: u64): u64 {
        let elapsed_128 = elapsed_ms as u128;
        let rate_128 = rate_per_10s as u128;
        let fee_128 = (elapsed_128 * rate_128) / (MILLIS_PER_10S as u128);
        fee_128 as u64
    }

    #[test_only]
    public fun calc_fee_for_testing(elapsed_ms: u64, rate_per_10s: u64): u64 {
        calc_fee(elapsed_ms, rate_per_10s)
    }
}
