import type { ViewObj } from './types'

export const account_balance_payload = (address: string): ViewObj => ({
  function: '0x1::ol_account::balance',
  type_arguments: [],
  arguments: [address],
})
