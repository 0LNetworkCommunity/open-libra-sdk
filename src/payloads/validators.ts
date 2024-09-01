import type { ViewObj } from './types'

export const currentValidatorsPayload: ViewObj = {
  function: '0x1::stake::get_current_validators',
  type_arguments: [],
  arguments: [],
}

export const eligibleValidatorsPayload: ViewObj = {
  function: '0x1::validator_universe::get_eligible_validators',
  type_arguments: [],
  arguments: [],
}

export const validatorBidPayload = (address: string): ViewObj => ({
  function: '0x1::proof_of_fee::current_bid',
  type_arguments: [],
  arguments: [address],
})

export const validatorGradePayload = (address: string): ViewObj => ({
  function: '0x1::grade::get_validator_grade',
  type_arguments: [],
  arguments: [address],
})

export const allVouchersPayload = (address: string): ViewObj => ({
  function: '0x1::vouch::all_vouchers',
  type_arguments: [],
  arguments: [address],
})

export const vouchersInSetPayload = (address: string): ViewObj => ({
  function: '0x1::vouch::true_friends',
  type_arguments: [],
  arguments: [address],
})
