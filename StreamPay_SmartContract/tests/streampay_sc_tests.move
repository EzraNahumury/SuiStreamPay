#[test_only]
module streampay_sc::streampay_sc_tests {
    use streampay_sc::streampay_sc;

    const E_ASSERT: u64 = 0;

    #[test]
    fun test_calc_fee_exact_10s() {
        let fee = streampay_sc::calc_fee_for_testing(10_000, 1_000);
        assert!(fee == 1_000, E_ASSERT);
    }

    #[test]
    fun test_calc_fee_half_interval() {
        let fee = streampay_sc::calc_fee_for_testing(5_000, 1_000);
        assert!(fee == 500, E_ASSERT);
    }

    #[test]
    fun test_calc_fee_round_down() {
        let fee = streampay_sc::calc_fee_for_testing(9_999, 1_000);
        assert!(fee == 999, E_ASSERT);
    }

    #[test]
    fun test_calc_fee_zero() {
        let fee = streampay_sc::calc_fee_for_testing(0, 1_000);
        assert!(fee == 0, E_ASSERT);
    }
}
