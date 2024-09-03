import type { ViewObj } from './types'

export const feesCollectedPayload: ViewObj = {
  function: '0x1::transaction_fee::system_fees_collected',
  type_arguments: [],
  arguments: [],
}

export const epochLengthPayload: ViewObj = {
  function: '0x1::block::get_epoch_interval_secs',
  type_arguments: [],
  arguments: [],
}

export const infraBalance: ViewObj = {
  function: '0x1::infra_escrow::infra_escrow_balance',
  type_arguments: [],
  arguments: [],
}

export const getConsensusReward: ViewObj = {
  function: '0x1::proof_of_fee::get_consensus_reward',
  type_arguments: [],
  arguments: [],
}
