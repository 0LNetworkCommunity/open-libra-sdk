import axios, { type AxiosInstance } from 'axios'
import type { EventObj, ViewObj } from '../payloads/types'
import { TESTNET_SEED_NODES } from '../constants'

const DEBUG_URL: string = 'http://rpc.0l.fyi/v1'

export let api: AxiosInstance
let apiUrl: string;
let apiUrlNote: string;
let apiReady: boolean;

export const initApi = async () => {
  const { url, note } = await fetchAPIConfig()

  api = axios.create({
    baseURL: url,
  })
  apiUrl = url
  apiUrlNote = note
  apiReady = true

  return { apiUrl, note }
}

// Overrides the API http address with user defined URL string
export const overrideApi = (url: string) => {
  api = axios.create({
    baseURL: url,
  })
  apiUrl = url
  apiUrlNote = 'override'
}

// Checks that the URL used for API is live
async function checkAPIConnectivity(url: string) {
  try {
    await axios.head(url)
    return true
  } catch (error) {
    return false
  }
}

// Creates the axios configuration for network requests
const fetchAPIConfig = async () => {
  let url = DEBUG_URL
  let note

  if (!url) {
    try {
      const response = await axios.get(TESTNET_SEED_NODES)
      const data = response.data

      for (const node of data.nodes) {
        const formatted_u = `${node.url}/v1`
        const isConnected = await checkAPIConnectivity(formatted_u)

        if (isConnected) {
          url = formatted_u
          note = node.note
          break
        }
      }

      if (!url) {
        console.error('Failed to connect to any API URL.')
      }
    } catch (error) {
      console.error(`Failed to fetch API config: ${error}`)
    }
  }

  return { url, note }
}

// Retrieves a Move resource on any account given the resource's "struct path" string. Uses GET to API.
export const getAccountResource = async (account: string, struct_path: string) => {
  return await api
    .get(`/accounts/${account}/resource/${struct_path}`)
    .then((r: { data: { data: any } }) => r.data.data)
    .catch((e: { message: any }) => {
      console.error(`Failed to get resource ${struct_path}, message: ${e.message}`)
      throw e
    })
}

// Gets the Diem API root with chain metadata
export const getIndex = async () => {
  try {
    const response = await api.get('')
    return response.data
  } catch (error: any) {
    console.error(`Failed to get index: ${error.message}`)
    throw error
  }
}

// Calls a "view" function on the chain via POST to API
export const postViewFunc = async (payload: ViewObj): Promise<any[]> => {
  return await api
    .post('/view', payload)
    .then((r: { data: any[] }) => {
      return r.data
    })
    .catch((e: { message: any }) => {
      console.error(
        `Failed to get view fn: ${payload.function}, args: ${payload.arguments} message: ${e.message}`,
      )
      throw e
    })
}


// Retrieves a list of events from an account via GET to API
export const getEventList = async (payload: EventObj) => {
  return await api
    .get(`/accounts/${payload.address}/events/${payload.struct}/${payload.handler_field}`)
    .then((r: { data: any }) => {
      return r.data
    })
    .catch((e: { message: any }) => {
      console.error(`Failed to get events ${payload}, message: ${e.message}`)
      throw e
    })
}
