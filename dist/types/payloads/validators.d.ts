import type { ViewObj } from "./types";
export declare const currentValidatorsPayload: ViewObj;
export declare const eligibleValidatorsPayload: ViewObj;
export declare const validatorBidPayload: (address: string) => ViewObj;
export declare const validatorGradePayload: (address: string) => ViewObj;
export declare const allVouchersPayload: (address: string) => ViewObj;
export declare const vouchesGiven: (address: string) => ViewObj;
export declare const vouchesReceived: (address: string) => ViewObj;
export declare const vouchesReceivedNotExpired: (address: string) => ViewObj;
export declare const vouchesReceivedValidNotFamily: (address: string) => ViewObj;
export declare const getPoFBidders: (filter_unqualified: boolean) => ViewObj;
export declare const getPoFErrors: (address: string) => ViewObj;
//# sourceMappingURL=validators.d.ts.map