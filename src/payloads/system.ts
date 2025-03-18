import type { ViewArgs } from "../types/clientPayloads";

export const feesCollectedPayload: ViewArgs = {
  payload: {function: "0x1::transaction_fee::system_fees_collected"},
};

// export const epochLengthPayload: ViewArgs = {
//   function: "0x1::block::get_epoch_interval_secs",
//   type_arguments: [],
//   arguments: [],
// };

// export const infraBalance: ViewArgs = {
//   function: "0x1::infra_escrow::infra_escrow_balance",
//   type_arguments: [],
//   arguments: [],
// };

// export const getConsensusReward: ViewArgs = {
//   function: "0x1::proof_of_fee::get_consensus_reward",
//   type_arguments: [],
//   arguments: [],
// };
