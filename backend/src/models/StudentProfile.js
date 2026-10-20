const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  techStack: [{ type: String }],
  link: { type: String, default: '' },
  githubLink: { type: String, default: '' }
}, { _id: true });

const CertificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, default: '' },
  issueDate: { type: String, default: '' },
  credentialUrl: { type: String, default: '' }
}, { _id: true });

const ExperienceSchema = new mongoose.Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, default: '' }
}, { _id: true });

const StudentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    collegeEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    university: {
      type: String,
      default: 'National Institute of Technology'
    },
    degree: {
      type: String,
      default: 'B.Tech'
    },
    branch: {
      type: String,
      default: 'Computer Science & Engineering'
    },
    graduationYear: {
      type: Number,
      required: true,
      default: 2026
    },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.0'],
      default: 8.0
    },
    backlogs: {
      type: Number,
      min: [0, 'Backlogs cannot be negative'],
      default: 0
    },
    skills: [
      {
        type: String,
        trim: true
      }
    ],
    projects: [ProjectSchema],
    certifications: [CertificationSchema],
    workExperience: [ExperienceSchema],
    resumeUrl: {
      type: String,
      default: ''
    },
    resumeOriginalName: {
      type: String,
      default: ''
    },
    resumeUploadedAt: {
      type: Date
    },
    githubUrl: {
      type: String,
      default: ''
    },
    linkedinUrl: {
      type: String,
      default: ''
    },
    portfolioUrl: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    isProfileComplete: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Calculate profile completeness helper
StudentProfileSchema.methods.calculateCompleteness = function () {
  let score = 0;
  if (this.fullName) score += 10;
  if (this.collegeEmail) score += 10;
  if (this.degree && this.branch) score += 10;
  if (this.graduationYear) score += 10;
  if (this.cgpa !== undefined && this.cgpa !== null) score += 10;
  if (this.skills && this.skills.length >= 3) score += 15;
  if (this.projects && this.projects.length >= 1) score += 15;
  if (this.resumeUrl) score += 15;
  if (this.githubUrl || this.linkedinUrl) score += 5;
  return Math.min(score, 100);
};

StudentProfileSchema.pre('save', function (next) {
  const completeness = this.calculateCompleteness();
  this.isProfileComplete = completeness >= 75;
  next();
});

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
