import type { ViewArgs } from "../types/clientPayloads";

export const currentValidatorsPayload: ViewArgs = {
  payload: { function: "0x1::stake::get_current_validators" },
};

export const eligibleValidatorsPayload: ViewArgs = {
  payload: { function: "0x1::validator_universe::get_eligible_validators" },
};

export const validatorBidPayload = (address: string): ViewArgs => ({
  payload: {
    function: "0x1::proof_of_fee::current_bid",
    functionArguments: [address],
  },
});

// TODO: get expiration

export const validatorGradePayload = (address: string): ViewArgs => ({
  payload: {
    function: "0x1::grade::get_validator_grade",
    functionArguments: [address],
  },
});

export const getPoFBidders = (filter_unqualified: boolean): ViewArgs => {
  return {
    payload: {
      function: "0x1::proof_of_fee::get_bidders_and_bids",
      functionArguments: [filter_unqualified],
    },
  };
};

export const getPoFErrors = (address: string): ViewArgs => {
  return {
    payload: {
      function: "0x1::proof_of_fee::audit_qualification",
      functionArguments: [address],
    },
  };
};
