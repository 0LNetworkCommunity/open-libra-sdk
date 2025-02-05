import { Aptos, type MoveStructId } from "@aptos-labs/ts-sdk";
export declare function wrapLibra(): Aptos;
export declare function get_resource<T extends object>(account: string, struct_id: MoveStructId): Promise<T>;
//# sourceMappingURL=vendorClient.d.ts.map