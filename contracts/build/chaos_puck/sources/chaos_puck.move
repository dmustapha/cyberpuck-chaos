// File: contracts/sources/chaos_puck.move
module chaos_puck::chaos_puck {
    use one::object::{Self, UID, ID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};
    use one::event;
    use std::string::{Self, String};

    // ========== Structs ==========

    /// Player profile owned by the player's wallet. Mutable for stat updates.
    public struct PlayerProfile has key, store {
        id: UID,
        elo: u64,
        wins: u64,
        losses: u64,
        matches_played: u64,
        modifiers_survived: u64,
    }

    /// Immutable record of a completed match.
    public struct MatchRecord has key, store {
        id: UID,
        player1: address,
        player2: address,
        score1: u8,
        score2: u8,
        duration_seconds: u64,
        modifiers_deployed: u8,
        timestamp: u64,
    }

    /// Immutable record of a single AI Chaos Agent decision.
    public struct ChaosAgentDecision has key, store {
        id: UID,
        match_id: ID,
        modifier_type: u8,
        target: u8,
        reason: String,
        timestamp: u64,
    }

    // ========== Events ==========

    public struct ProfileCreated has copy, drop {
        profile_id: ID,
        owner: address,
    }

    public struct MatchRecorded has copy, drop {
        match_id: ID,
        player1: address,
        player2: address,
        score1: u8,
        score2: u8,
    }

    public struct DecisionRecorded has copy, drop {
        decision_id: ID,
        match_id: ID,
        modifier_type: u8,
    }

    // ========== Functions ==========

    /// Create a new player profile. Called by player's wallet (client-signed).
    /// Profile is transferred to the sender (owned object).
    public entry fun create_profile(ctx: &mut TxContext) {
        let profile = PlayerProfile {
            id: object::new(ctx),
            elo: 1000,
            wins: 0,
            losses: 0,
            matches_played: 0,
            modifiers_survived: 0,
        };
        let profile_id = object::id(&profile);
        let owner = tx_context::sender(ctx);
        event::emit(ProfileCreated { profile_id, owner });
        transfer::public_transfer(profile, owner);
    }

    /// Update profile after a win. Called by player's wallet (client-signed).
    public entry fun update_profile_win(
        profile: &mut PlayerProfile,
        elo_gain: u64,
        modifiers_survived_count: u64,
    ) {
        profile.elo = profile.elo + elo_gain;
        profile.wins = profile.wins + 1;
        profile.matches_played = profile.matches_played + 1;
        profile.modifiers_survived = profile.modifiers_survived + modifiers_survived_count;
    }

    /// Update profile after a loss. Called by player's wallet (client-signed).
    public entry fun update_profile_loss(
        profile: &mut PlayerProfile,
        elo_loss: u64,
        modifiers_survived_count: u64,
    ) {
        if (elo_loss > profile.elo) {
            profile.elo = 0;
        } else {
            profile.elo = profile.elo - elo_loss;
        };
        profile.losses = profile.losses + 1;
        profile.matches_played = profile.matches_played + 1;
        profile.modifiers_survived = profile.modifiers_survived + modifiers_survived_count;
    }

    /// Record a completed match. Called by server keypair. Creates immutable object.
    public entry fun record_match(
        player1: address,
        player2: address,
        score1: u8,
        score2: u8,
        duration_seconds: u64,
        modifiers_deployed: u8,
        timestamp: u64,
        ctx: &mut TxContext,
    ) {
        let record = MatchRecord {
            id: object::new(ctx),
            player1,
            player2,
            score1,
            score2,
            duration_seconds,
            modifiers_deployed,
            timestamp,
        };
        let match_id = object::id(&record);
        event::emit(MatchRecorded { match_id, player1, player2, score1, score2 });
        transfer::public_freeze_object(record);
    }

    /// Record a single AI decision. Called by server keypair. Creates immutable object.
    public entry fun record_decision(
        match_id: ID,
        modifier_type: u8,
        target: u8,
        reason: vector<u8>,
        timestamp: u64,
        ctx: &mut TxContext,
    ) {
        let decision = ChaosAgentDecision {
            id: object::new(ctx),
            match_id,
            modifier_type,
            target,
            reason: string::utf8(reason),
            timestamp,
        };
        let decision_id = object::id(&decision);
        event::emit(DecisionRecorded { decision_id, match_id, modifier_type });
        transfer::public_freeze_object(decision);
    }
}
