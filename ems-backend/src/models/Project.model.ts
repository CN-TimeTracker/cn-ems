import { Schema, model, Types } from 'mongoose';
import { IProject, ProjectStatus } from '../interfaces';

// ─────────────────────────────────────────────
// SCHEMA
// ─────────────────────────────────────────────

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [150, 'Project name cannot exceed 150 characters'],
    },

    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [100, 'Client name cannot exceed 100 characters'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Custom Product', 'Support', 'Product'],
      default: 'Product',
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },

    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },

    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.Active,
    },

    allocatedHours: {
      type: Number,
      required: [true, 'Allocated hours are required'],
      default: 0,
    },

    assignedTo: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────

ProjectSchema.index({ status: 1 });
ProjectSchema.index({ deadline: 1 });
ProjectSchema.index({ createdBy: 1 });

// ─────────────────────────────────────────────
// MODEL EXPORT
// ─────────────────────────────────────────────

const Project = model<IProject>('Project', ProjectSchema);
export default Project;
