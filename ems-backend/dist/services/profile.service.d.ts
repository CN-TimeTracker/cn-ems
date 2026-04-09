import { IProfileUpdateChanges } from '../interfaces';
export declare class ProfileUpdateService {
    requestUpdate(userId: string, changes: IProfileUpdateChanges): Promise<import("mongoose").Document<unknown, {}, import("../interfaces").IProfileUpdateRequest, {}, {}> & import("../interfaces").IProfileUpdateRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getPendingRequestForUser(userId: string): Promise<(import("mongoose").FlattenMaps<import("../interfaces").IProfileUpdateRequest> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    getAllPendingRequests(): Promise<(import("mongoose").FlattenMaps<import("../interfaces").IProfileUpdateRequest> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    approveRequest(requestId: string, adminId: string): Promise<import("mongoose").Document<unknown, {}, import("../interfaces").IProfileUpdateRequest, {}, {}> & import("../interfaces").IProfileUpdateRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    rejectRequest(requestId: string, adminId: string): Promise<import("mongoose").Document<unknown, {}, import("../interfaces").IProfileUpdateRequest, {}, {}> & import("../interfaces").IProfileUpdateRequest & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
//# sourceMappingURL=profile.service.d.ts.map