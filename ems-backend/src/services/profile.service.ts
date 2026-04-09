import ProfileUpdateRequest from '../models/ProfileUpdateRequest.model';
import User from '../models/User.model';
import { IProfileUpdateChanges, ProfileUpdateRequestStatus } from '../interfaces';

export class ProfileUpdateService {

  // ─────────────────────────────────────────────
  // EMPLOYEE: Request a profile update
  // ─────────────────────────────────────────────

  async requestUpdate(userId: string, changes: IProfileUpdateChanges) {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    // Upsert a pending request for this user
    // If they already have a pending request, we overwrite it with the latest changes
    const request = await ProfileUpdateRequest.findOneAndUpdate(
      { userId, status: ProfileUpdateRequestStatus.Pending },
      { requestedChanges: changes },
      { new: true, upsert: true }
    );

    return request;
  }

  // ─────────────────────────────────────────────
  // EMPLOYEE/ADMIN: Get current pending request for user
  // ─────────────────────────────────────────────

  async getPendingRequestForUser(userId: string) {
    return ProfileUpdateRequest.findOne({ 
      userId, 
      status: ProfileUpdateRequestStatus.Pending 
    }).lean();
  }

  // ─────────────────────────────────────────────
  // ADMIN: Get all pending requests
  // ─────────────────────────────────────────────

  async getAllPendingRequests() {
    return ProfileUpdateRequest.find({ status: ProfileUpdateRequestStatus.Pending })
      .populate('userId', 'name email employeeCode profilePicture')
      .sort({ createdAt: -1 })
      .lean();
  }

  // ─────────────────────────────────────────────
  // ADMIN: Get all reviewed requests (History)
  // ─────────────────────────────────────────────

  async getReviewHistory() {
    return ProfileUpdateRequest.find({ 
      status: { $in: [ProfileUpdateRequestStatus.Approved, ProfileUpdateRequestStatus.Rejected, ProfileUpdateRequestStatus.Revoked] } 
    })
      .populate('userId', 'name email employeeCode profilePicture')
      .populate('reviewedBy', 'name')
      .sort({ reviewedAt: -1 })
      .limit(50)
      .lean();
  }

  // ─────────────────────────────────────────────
  // ADMIN: Approve request
  // ─────────────────────────────────────────────

  async approveRequest(requestId: string, adminId: string) {
    const request = await ProfileUpdateRequest.findById(requestId);
    if (!request) {
      throw Object.assign(new Error('Request not found'), { statusCode: 404 });
    }
    if (request.status !== ProfileUpdateRequestStatus.Pending) {
      throw Object.assign(new Error(`Request is already ${request.status}`), { statusCode: 400 });
    }

    const user = await User.findById(request.userId);
    if (!user) {
      throw Object.assign(new Error('User associated with this request not found'), { statusCode: 404 });
    }

    // Capture previous values before applying changes
    const previousValues: Record<string, any> = {};
    const changes = request.requestedChanges as any;
    
    Object.keys(changes).forEach(key => {
      if (changes[key] !== undefined) {
        previousValues[key] = (user as any)[key];
      }
    });

    // Apply approved changes
    Object.assign(user, request.requestedChanges);
    await user.save();

    // Mark request as Approved and store history
    request.status = ProfileUpdateRequestStatus.Approved;
    request.previousValues = previousValues as any;
    request.reviewedBy = adminId as any;
    request.reviewedAt = new Date();
    await request.save();

    return request;
  }

  // ─────────────────────────────────────────────
  // ADMIN: Reject request
  // ─────────────────────────────────────────────

  async rejectRequest(requestId: string, adminId: string) {
    const request = await ProfileUpdateRequest.findById(requestId);
    if (!request) {
      throw Object.assign(new Error('Request not found'), { statusCode: 404 });
    }
    if (request.status !== ProfileUpdateRequestStatus.Pending) {
      throw Object.assign(new Error(`Request is already ${request.status}`), { statusCode: 400 });
    }

    // Mark as Rejected
    request.status = ProfileUpdateRequestStatus.Rejected;
    request.reviewedBy = adminId as any;
    request.reviewedAt = new Date();
    await request.save();

    return request;
  }

  // ─────────────────────────────────────────────
  // ADMIN: Revoke request
  // ─────────────────────────────────────────────

  async revokeRequest(requestId: string, adminId: string) {
    const request = await ProfileUpdateRequest.findById(requestId);
    if (!request) {
      throw Object.assign(new Error('Request not found'), { statusCode: 404 });
    }
    if (request.status !== ProfileUpdateRequestStatus.Approved) {
      throw Object.assign(new Error('Only approved requests can be revoked'), { statusCode: 400 });
    }
    if (!request.previousValues) {
      throw Object.assign(new Error('No previous values found to restore'), { statusCode: 400 });
    }

    const user = await User.findById(request.userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    // Restore previous values
    Object.assign(user, request.previousValues);
    await user.save();

    // Mark as Revoked
    request.status = ProfileUpdateRequestStatus.Revoked;
    request.reviewedBy = adminId as any;
    request.reviewedAt = new Date(); // Update review time to revocation time
    await request.save();

    return request;
  }
}
