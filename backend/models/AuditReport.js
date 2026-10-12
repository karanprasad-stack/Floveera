import mongoose from 'mongoose';

const auditReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Comprehensive Audit',
      'Financial Audit',
      'Tax Reconciliation',
      'Inventory Audit',
      'Operations Review',
      'Quality Control'
    ]
  },
  format: {
    type: String,
    default: 'PDF'
  },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    label: { type: String, default: 'Custom Period' }
  },
  generatedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'System Admin' },
    role: { type: String, default: 'RESTAURANT_ADMIN' }
  },
  summary: {
    ordersAnalyzed: { type: Number, default: 0 },
    qualifyingRevenue: { type: Number, default: 0 },
    discrepanciesCount: { type: Number, default: 0 },
    inventoryItemsAudited: { type: Number, default: 0 },
    inventoryTransactionsCount: { type: Number, default: 0 },
    activityLogsEvaluated: { type: Number, default: 0 }
  },
  discrepancies: [
    {
      severity: {
        type: String,
        enum: ['HIGH', 'MEDIUM', 'LOW', 'INFO'],
        default: 'MEDIUM'
      },
      type: { type: String, required: true },
      reference: { type: String, default: 'N/A' },
      description: { type: String, required: true },
      recommendedAction: { type: String, default: 'Investigate transaction ledger.' }
    }
  ],
  facts: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  limitationsNotice: {
    type: String,
    default: ''
  },
  fileSize: {
    type: String,
    default: '1.2 MB'
  }
}, { timestamps: true });

export default mongoose.model('AuditReport', auditReportSchema);
