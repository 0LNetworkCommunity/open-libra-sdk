import { type AxiosInstance } from "axios";
import type { EventObj, ViewObj } from "../payloads/types";
export declare const DEBUG_URL: string;
export declare const CANONICAL_URL: string;
export declare class LibraClient {
    url: string;
    note: string;
    clientInit: boolean;
    connected: boolean;
    client: AxiosInstance;
    constructor(url?: string, note?: string);
    setClient(url?: string): Promise<void>;
    searchSeedFullnodes(): Promise<void>;
    assertReady(): void;
    connect(url?: string): Promise<boolean>;
    getIndex(): Promise<any>;
    getAccountResource(account: string, struct_path: string): Promise<object[]>;
    postViewFunc(payload: ViewObj): Promise<object[]>;
    getEventList(payload: EventObj): Promise<object[]>;
}
//# sourceMappingURL=api.d.ts.map