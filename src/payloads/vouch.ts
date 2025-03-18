import type { ViewArgs } from "../types/clientPayloads";

export const allVouchersPayload = (address: string): ViewArgs => ({
  payload: {
    function: "0x1::vouch::all_vouchers",
    functionArguments: [address]
  },
});

// all vouches given out returns two arrays address[] expiration[]
export const vouchesGiven = (address: string): ViewArgs => ({
  payload: {
    function: "0x1::vouch::get_given_vouches",
    functionArguments: [address]
  },
});

// all vouches received, weather or not they are valid two arrays address[] expiration[]
export const vouchesReceived = (address: string): ViewArgs => ({
  payload: {
    function: "0x1::vouch::get_received_vouches",
    functionArguments: [address]
  },
});

// get all vouches received and filter out expired ones
export const vouchesReceivedNotExpired = (address: string): ViewArgs => ({
  payload: {
    function: "0x1::vouch::all_not_expired",
    functionArguments: [address]
  },
});

// removes expired vouches, and vouches from family members
export const vouchesReceivedValidNotFamily = (address: string): ViewArgs => ({
  payload: {
    function: "0x1::vouch::true_friends",
    functionArguments: [address]
  },
});
