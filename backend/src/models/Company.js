const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    logo: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    industry: {
      type: String,
      default: 'Technology'
    },
    website: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+', '1000+', '10000+'],
      default: '51-200'
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    recruiters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    contactEmail: {
      type: String,
      trim: true
    },
    isDemo: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

CompanySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Company', CompanySchema);
