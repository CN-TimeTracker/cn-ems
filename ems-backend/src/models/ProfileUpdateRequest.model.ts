import { Schema, model } from 'mongoose';
import { IProfileUpdateRequest, ProfileUpdateRequestStatus, Gender } from '../interfaces';

// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────

const ProfileUpdateRequestSchema = new Schema<IProfileUpdateRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    requestedChanges: {
      name: { type: String, trim: true },
      username: { type: String, trim: true },
      phoneNumber: { type: String, trim: true },
      dateOfBirth: { type: Date },
      gender: { type: String, enum: Object.values(Gender) },
      fatherName: { type: String, trim: true },
      currentAddress: { type: String, trim: true },
      permanentAddress: { type: String, trim: true },
      description: { type: String, trim: true },
    },
    previousValues: {
      name: { type: String, trim: true },
      username: { type: String, trim: true },
      phoneNumber: { type: String, trim: true },
      dateOfBirth: { type: Date },
      gender: { type: String, enum: Object.values(Gender) },
      fatherName: { type: String, trim: true },
      currentAddress: { type: String, trim: true },
      permanentAddress: { type: String, trim: true },
      description: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: Object.values(ProfileUpdateRequestStatus),
      default: ProfileUpdateRequestStatus.Pending,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// We can only have one pending request per user at a time
ProfileUpdateRequestSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: ProfileUpdateRequestStatus.Pending } }
);

ProfileUpdateRequestSchema.index({ status: 1 });

const ProfileUpdateRequest = model<IProfileUpdateRequest>('ProfileUpdateRequest', ProfileUpdateRequestSchema);
export default ProfileUpdateRequest;
