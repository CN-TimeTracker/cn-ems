import { IProfileUpdateChanges, ProfileUpdateRequestStatus } from '../interfaces';
export declare class ProfileUpdateService {
    requestUpdate(userId: string, changes: IProfileUpdateChanges): Promise<import("mongoose").Document<unknown, {}, import("../interfaces").IProfileUpdateRequest, {}, {}> & import("../interfaces").IProfileUpdateRequest & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    getPendingRequestForUser(userId: string): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        userId: string | import("../interfaces").IUser;
        requestedChanges: {
            name?: string | undefined;
            username?: string | undefined;
            phoneNumber?: string | undefined;
            dateOfBirth?: Date | undefined;
            gender?: import("../interfaces").Gender | undefined;
            fatherName?: string | undefined;
            currentAddress?: string | undefined;
            permanentAddress?: string | undefined;
            description?: string | undefined;
        };
        previousValues?: {
            name?: string | undefined;
            username?: string | undefined;
            phoneNumber?: string | undefined;
            dateOfBirth?: Date | undefined;
            gender?: import("../interfaces").Gender | undefined;
            fatherName?: string | undefined;
            currentAddress?: string | undefined;
            permanentAddress?: string | undefined;
            description?: string | undefined;
        } | undefined;
        status: ProfileUpdateRequestStatus;
        reviewedBy?: (string | import("../interfaces").IUser) | undefined;
        reviewedAt?: Date | undefined;
        createdAt: Date;
        updatedAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
    getAllPendingRequests(): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        userId: string | import("../interfaces").IUser;
        requestedChanges: {
            name?: string | undefined;
            username?: string | undefined;
            phoneNumber?: string | undefined;
            dateOfBirth?: Date | undefined;
            gender?: import("../interfaces").Gender | undefined;
            fatherName?: string | undefined;
            currentAddress?: string | undefined;
            permanentAddress?: string | undefined;
            description?: string | undefined;
        };
        previousValues?: {
            name?: string | undefined;
            username?: string | undefined;
            phoneNumber?: string | undefined;
            dateOfBirth?: Date | undefined;
            gender?: import("../interfaces").Gender | undefined;
            fatherName?: string | undefined;
            currentAddress?: string | undefined;
            permanentAddress?: string | undefined;
            description?: string | undefined;
        } | undefined;
        status: ProfileUpdateRequestStatus;
        reviewedBy?: (string | import("../interfaces").IUser) | undefined;
        reviewedAt?: Date | undefined;
        createdAt: Date;
        updatedAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    getReviewHistory(): Promise<(import("mongoose").FlattenMaps<{
        _id: string;
        userId: string | import("../interfaces").IUser;
        requestedChanges: {
            name?: string | undefined;
            username?: string | undefined;
            phoneNumber?: string | undefined;
            dateOfBirth?: Date | undefined;
            gender?: import("../interfaces").Gender | undefined;
            fatherName?: string | undefined;
            currentAddress?: string | undefined;
            permanentAddress?: string | undefined;
            description?: string | undefined;
        };
        previousValues?: {
            name?: string | undefined;
            username?: string | undefined;
            phoneNumber?: string | undefined;
            dateOfBirth?: Date | undefined;
            gender?: import("../interfaces").Gender | undefined;
            fatherName?: string | undefined;
            currentAddress?: string | undefined;
            permanentAddress?: string | undefined;
            description?: string | undefined;
        } | undefined;
        status: ProfileUpdateRequestStatus;
        reviewedBy?: (string | import("../interfaces").IUser) | undefined;
        reviewedAt?: Date | undefined;
        createdAt: Date;
        updatedAt: Date;
    }> & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    approveRequest(requestId: string, adminId: string): Promise<import("mongoose").Document<unknown, {}, import("../interfaces").IProfileUpdateRequest, {}, {}> & import("../interfaces").IProfileUpdateRequest & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    rejectRequest(requestId: string, adminId: string): Promise<import("mongoose").Document<unknown, {}, import("../interfaces").IProfileUpdateRequest, {}, {}> & import("../interfaces").IProfileUpdateRequest & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    revokeRequest(requestId: string, adminId: string): Promise<import("mongoose").Document<unknown, {}, import("../interfaces").IProfileUpdateRequest, {}, {}> & import("../interfaces").IProfileUpdateRequest & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
}
//# sourceMappingURL=profile.service.d.ts.map