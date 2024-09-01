// https://rpc.openlibra.space:8080/v1/accounts/0x1/events/0x1::diem_governance::GovernanceEvents/vote_events

import type { EventObj } from './types'

export const govEvents = (): EventObj => {
  return {
    address: '0x1',
    struct: '0x1::diem_governance::GovernanceEvents',
    handler_field: 'vote_events',
  }
}
