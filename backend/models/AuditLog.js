import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    index: true
  },
  invitationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeInvitation'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
