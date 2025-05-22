// This is an example Move module so that
// we can use it as a target for the Move sdk view function generator.
// it's adapted from the Diem framework's governance module
// since it has a variety of language symbols.
module diem_framework::example {
    use std::error;

    //////// ERROR CODES ////////
    /// The specified address already been used to vote on the same proposal
    const EALREADY_VOTED: u64 = 4;


    //////// CONSTANTS ////////
    /// This matches the same enum const in voting. We have to duplicate it as Move doesn't have support for enums yet.
    const PROPOSAL_STATE_SUCCEEDED: u64 = 1;

    /// Store the SignerCapabilities of accounts under the on-chain governance's control.
    struct GovernanceResponsbility has key {
        signer_caps: SimpleMap<address, SignerCapability>,
    }

    /// Update the governance configurations. This can only be called as part of resolving a proposal in this same
    /// DiemGovernance.
    public fun update_governance_config(
        diem_framework: &signer,
        min_voting_threshold: u128,
        voting_duration_secs: u64,
    ) acquires GovernanceConfig, GovernanceEvents {
        system_addresses::assert_diem_framework(diem_framework);

        let governance_config = borrow_global_mut<GovernanceConfig>(@diem_framework);
        governance_config.voting_duration_secs = voting_duration_secs;
        governance_config.min_voting_threshold = min_voting_threshold;

        let events = borrow_global_mut<GovernanceEvents>(@diem_framework);
        event::emit_event<UpdateConfigEvent>(
            &mut events.update_config_events,
            UpdateConfigEvent {
                min_voting_threshold,
                voting_duration_secs
            },
        );
    }


    /// Create a single-step or multi-step proposal
    /// @param execution_hash Required. This is the hash of the resolution script. When the proposal is resolved,
    /// only the exact script with matching hash can be successfully executed.
    fun create_proposal_v2(
        proposer: &signer,
        execution_hash: vector<u8>,
        metadata_location: vector<u8>,
        metadata_hash: vector<u8>,
        is_multi_step_proposal: bool,
    ) acquires GovernanceConfig, GovernanceEvents {
        let proposer_address = signer::address_of(proposer);

        let governance_config =
        borrow_global<GovernanceConfig>(@diem_framework);

        let current_time = timestamp::now_seconds();
        let proposal_expiration = current_time + governance_config.voting_duration_secs;

        // Create and validate proposal metadata.
        let proposal_metadata = create_proposal_metadata(metadata_location, metadata_hash);

        let proposal_id = voting::create_proposal_v2(
            proposer_address,
            @diem_framework,
            governance_proposal::create_proposal(),
            execution_hash,
            governance_config.min_voting_threshold,
            proposal_expiration,
            option::none(),
            proposal_metadata,
            is_multi_step_proposal,
        );

        let events = borrow_global_mut<GovernanceEvents>(@diem_framework);
        event::emit_event<CreateProposalEvent>(
            &mut events.create_proposal_events,
            CreateProposalEvent {
                proposal_id,
                proposer: proposer_address,
                execution_hash,
                proposal_metadata,
            },
        );
    }


    /// Vote on proposal with `proposal_id`.
    public entry fun ol_vote(
        voter: &signer,
        proposal_id: u64,
        should_pass: bool,
    ) acquires ApprovedExecutionHashes, GovernanceEvents, VotingRecords {
        let voter_address = signer::address_of(voter);
        assert!(stake::is_current_val(voter_address), error::invalid_argument(EUNAUTHORIZED));
        // register the vote. Prevent double votes
        // TODO: method to retract.
        let voting_records = borrow_global_mut<VotingRecords>(@diem_framework);
        let record_key = RecordKey {
            voter: voter_address,
            proposal_id,
        };
        assert!(
            !table::contains(&voting_records.votes, record_key),
            error::invalid_argument(EALREADY_VOTED));
        table::add(&mut voting_records.votes, record_key, true);

        let voting_power = 1; // every validator has just one equal vote.
        voting::vote<GovernanceProposal>(
            &governance_proposal::create_empty_proposal(),
            @diem_framework,
            proposal_id,
            voting_power,
            should_pass,
        );

        let events = borrow_global_mut<GovernanceEvents>(@diem_framework);
        event::emit_event<VoteEvent>(
            &mut events.vote_events,
            VoteEvent {
                proposal_id,
                voter: voter_address,
                num_votes: voting_power,
                should_pass,
            },
        );

        let proposal_state = voting::get_proposal_state<GovernanceProposal>(@diem_framework, proposal_id);
        if (proposal_state == PROPOSAL_STATE_SUCCEEDED) {
            add_approved_script_hash(proposal_id);
        }
    }



    #[view]
    public fun get_voting_duration_secs(): u64 acquires GovernanceConfig {
        borrow_global<GovernanceConfig>(@diem_framework).voting_duration_secs
    }


    #[view]
    // is the proposal complete and executed?
    public fun is_resolved(proposal_id: u64): bool {
      voting::is_resolved<GovernanceProposal>(@diem_framework, proposal_id)
    }

    #[test_only]
    //////// 0L //////// remove minimum threshold
    public fun initialize_for_test(root: &signer) {
      system_addresses::assert_ol(root);

      let min_voting_threshold = 0;
      let dummy = 0; // see code, requires refactor
      let voting_duration_secs = 100000000000;


      initialize(root, min_voting_threshold, dummy, voting_duration_secs);
    }

    // COMMIT NOTE: remove vendor tests for coin-based voting. Silly rabbit.

    #[verify_only]
    public fun initialize_for_verification(
        diem_framework: &signer,
        min_voting_threshold: u128,
        voting_duration_secs: u64,
    ) {
        initialize(diem_framework, min_voting_threshold, 0, voting_duration_secs);
    }
}
