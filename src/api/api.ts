import axios, { type AxiosInstance } from "axios";
import type { EventObj, ViewObj } from "../payloads/types";
import { TESTNET_SEED_NODES } from "../constants";

export const DEBUG_URL: string = "http://localhost:8480/v1";
export const CANONICAL_URL: string = "https://rpc.scan.openlibra.world/v1";

export class LibraClient {
  url: string;
  note: string;
  clientInit: boolean;
  connected: boolean;
  client: AxiosInstance;

  constructor(url?: string, note?: string) {
    this.url = url ? url : DEBUG_URL;
    this.note = note ? note : this.url;
    this.connected = false;
    this.client = axios.create({
      baseURL: this.url,
    });
    this.clientInit = true;
  }

  async setClient(url?: string): Promise<void> {
    this.client = axios.create({
      baseURL: url ? url : this.url,
    });
    this.clientInit = true;
  }

  async searchSeedFullnodes(): Promise<void> {
    try {
      const response = await axios.get(TESTNET_SEED_NODES);
      const data = response.data;

      for (const node of data.nodes) {
        const formatted_u = `${node.url}/v1`;
        const isConnected = await this.connect(formatted_u);

        if (isConnected) {
          this.url = formatted_u;
          this.note = node.note;
          this.connected = true;
          this.clientInit = false; // need to reset
          this.setClient();
          break;
        }
      }
      if (!this.connected || !this.clientInit) {
        console.error("Failed to connect to any API URL.");
      }
    } catch (error) {
      console.error(`Failed to fetch API config: ${error}`);
    }
  }

  assertReady() {
    if (!this.client) {
      throw "no client initialized";
    }
    if (!this.connected) {
      throw "client is not connected";
    }
  }

  // Checks that the URL used for API is live
  async connect(url?: string): Promise<boolean> {
    try {
      const u = url ? url : this.url;
      await axios.head(u);
      this.connected = true;
      return true;
    } catch {
      this.connected = false;
      return false;
    }
  }

  // Gets the Diem API root with chain metadata
  async getIndex() {
    try {
      const response = await this.client.get("");
      return response.data;
    } catch (error) {
      console.error(`Failed to get index: ${error}`);
      // throw because if we can't get index, nothing else is possible
      throw error;
    }
  }

  // Retrieves a Move resource on any account given the resource's "struct path" string. Uses GET to API.
  async getAccountResource(account: string, struct_path: string) {
    this.assertReady();

    return await this.client
      .get(`/accounts/${account}/resource/${struct_path}`)
      .then((r: { data: { data: object[] } }) => r.data.data)
      .catch((e) => {
        const errMsg = `Failed to get resource ${struct_path}, message: ${e.message}`;
        console.error(errMsg);
        throw e;
      });
  }

  // Calls a "view" function on the chain via POST to API
  async postViewFunc(payload: ViewObj): Promise<object[]> {
    this.assertReady();

    return await this.client
      .post("/view", payload)
      .then((r: { data: object[] }) => {
        return r.data;
      })
      .catch((e: { message: object }) => {
        const errMsg = `Failed to get view fn: ${payload.function}, args: ${payload.arguments} message: ${e.message}`;
        console.error(errMsg);
        return [];
      });
  }
  // Retrieves a list of events from an account via GET to API
  async getEventList(payload: EventObj): Promise<object[]> {
    this.assertReady();

    return this.client
      .get(
        `/accounts/${payload.address}/events/${payload.struct}/${payload.handler_field}`,
      )
      .then((r: { data: object[] }) => {
        return r.data;
      })
      .catch((e: { message: object[] }) => {
        const errMsg = `Failed to get events ${payload}, message: ${e.message}`;
        console.error(errMsg);
        throw e;
      });
  }
}
