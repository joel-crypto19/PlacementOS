const mongoose = require('mongoose');
const env = require('../config/env');
const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const Interview = require('../models/Interview');
const PlacementDrive = require('../models/PlacementDrive');
const DataSource = require('../models/DataSource');
const SyncLog = require('../models/SyncLog');
const AuditLog = require('../models/AuditLog');

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Clearing previous records...');
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await SavedJob.deleteMany({});
    await Interview.deleteMany({});
    await PlacementDrive.deleteMany({});
    await DataSource.deleteMany({});
    await SyncLog.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('[Seeder] Creating admin account...');
    const admin = await User.create({
      name: 'Dr. Placement Officer (Admin)',
      email: 'admin@college.edu',
      password: 'Admin@1234Password',
      role: 'admin',
      isVerified: true,
      status: 'active',
      phone: '+91 98765 43210'
    });

    console.log('[Seeder] Creating companies...');
    const googleCompany = await Company.create({
      name: 'Google India',
      description: 'Global technology leader specializing in internet-related services, cloud computing, and software.',
      industry: 'Internet & Technology',
      website: 'https://careers.google.com',
      location: 'Bangalore / Hyderabad, India',
      size: '10000+',
      verificationStatus: 'verified',
      contactEmail: 'campus-india@google.com',
      createdBy: admin._id
    });

    const microsoftCompany = await Company.create({
      name: 'Microsoft IDC',
      description: 'Empowering every person and organization on the planet to achieve more through software & cloud.',
      industry: 'Software & Cloud',
      website: 'https://careers.microsoft.com',
      location: 'Hyderabad / Noida / Bangalore, India',
      size: '10000+',
      verificationStatus: 'verified',
      contactEmail: 'university-india@microsoft.com',
      createdBy: admin._id
    });

    const infosysCompany = await Company.create({
      name: 'Infosys Limited',
      description: 'Next-generation digital services and consulting facilitating enterprise transformations.',
      industry: 'IT Services & Consulting',
      website: 'https://www.infosys.com/careers',
      location: 'Pune / Bangalore / Chennai, India',
      size: '10000+',
      verificationStatus: 'verified',
      contactEmail: 'campusrecruitment@infosys.com',
      createdBy: admin._id
    });

    const startupXCompany = await Company.create({
      name: 'Apex AI Systems',
      description: 'Next-generation AI agents for enterprise workflow automation and analytics.',
      industry: 'Artificial Intelligence',
      website: 'https://apexai.example.com',
      location: 'Bangalore, India (Remote-friendly)',
      size: '11-50',
      verificationStatus: 'pending', // Pending verification demo
      contactEmail: 'talent@apexai.example.com',
      createdBy: admin._id
    });

    console.log('[Seeder] Creating recruiter accounts...');
    const googleRecruiter = await User.create({
      name: 'Ananya Sharma',
      email: 'recruiter.google@placementos.edu',
      password: 'Recruiter@1234Password',
      role: 'recruiter',
      isVerified: true,
      status: 'active',
      company: googleCompany._id,
      phone: '+91 98111 22334'
    });
    googleCompany.recruiters.push(googleRecruiter._id);
    await googleCompany.save();

    const microsoftRecruiter = await User.create({
      name: 'Vikram Malhotra',
      email: 'recruiter.ms@placementos.edu',
      password: 'Recruiter@1234Password',
      role: 'recruiter',
      isVerified: true,
      status: 'active',
      company: microsoftCompany._id,
      phone: '+91 98222 33445'
    });
    microsoftCompany.recruiters.push(microsoftRecruiter._id);
    await microsoftCompany.save();

    const pendingRecruiter = await User.create({
      name: 'Rohan Deshmukh',
      email: 'pending.recruiter@apexai.example.com',
      password: 'Recruiter@1234Password',
      role: 'recruiter',
      isVerified: false,
      status: 'pending', // Pending recruiter demonstration
      company: startupXCompany._id,
      requestedCompanyName: 'Apex AI Systems',
      phone: '+91 98333 44556'
    });
    startupXCompany.recruiters.push(pendingRecruiter._id);
    await startupXCompany.save();

    console.log('[Seeder] Creating placement drives...');
    const mainDrive = await PlacementDrive.create({
      title: 'Annual Campus Recruitment Drive 2025-2026',
      description: 'Flagship campus hiring drive for final year B.Tech, M.Tech, and MCA engineering students.',
      academicYear: '2025-2026',
      semester: 'Final Year Campus Recruitment',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      eligibleBranches: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering'],
      minCgpa: 7.0,
      maxBacklogs: 0,
      status: 'ongoing',
      participatingCompanies: [googleCompany._id, microsoftCompany._id, infosysCompany._id],
      coordinatorName: 'Dr. Placement Officer',
      coordinatorEmail: 'admin@college.edu',
      createdBy: admin._id
    });

    const summerDrive = await PlacementDrive.create({
      title: 'Summer Internship Placement Program 2026',
      description: 'Exclusive 2 to 6 month summer technical internships for pre-final year students.',
      academicYear: '2025-2026',
      semester: 'Pre-Final Year Summer Drive',
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      eligibleBranches: ['Computer Science & Engineering', 'Information Technology'],
      minCgpa: 7.5,
      maxBacklogs: 0,
      status: 'upcoming',
      participatingCompanies: [googleCompany._id, microsoftCompany._id],
      coordinatorName: 'Dr. Placement Officer',
      coordinatorEmail: 'admin@college.edu',
      createdBy: admin._id
    });

    console.log('[Seeder] Creating job and internship listings...');
    const jobs = await Job.create([
      {
        title: 'Associate Software Engineer (Campus 2026)',
        company: googleCompany._id,
        companyName: 'Google India',
        description: 'Join Google\'s core engineering teams to solve complex distributed systems challenges at global scale.',
        responsibilities: [
          'Design, build, and deploy reliable web-scale microservices and cloud infrastructure.',
          'Optimize code performance, memory utilization, and latency across distributed databases.',
          'Collaborate with global site reliability engineers and product managers.'
        ],
        requirements: [
          'Strong foundation in Data Structures, Algorithms, and Object-Oriented Design.',
          'Fluency in one or more modern programming languages: C++, Java, Python, or Go.',
          'Understanding of relational databases, concurrency, and RESTful architectures.'
        ],
        skillsRequired: ['Data Structures', 'Algorithms', 'C++', 'Python', 'Distributed Systems'],
        jobType: 'full-time',
        workMode: 'hybrid',
        location: 'Bangalore, Karnataka, India',
        salaryOrStipend: {
          min: 1800000,
          max: 2600000,
          currency: 'INR',
          period: 'yearly',
          isDisclosed: true
        },
        eligibility: {
          minCgpa: 8.0,
          allowedBranches: ['Computer Science & Engineering', 'Information Technology'],
          allowedGraduationYears: [2026],
          maxBacklogs: 0
        },
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        applicationMethod: 'internal',
        drive: mainDrive._id,
        status: 'open',
        sourceProvider: 'direct',
        createdBy: googleRecruiter._id,
        isDemo: true
      },
      {
        title: 'Software Development Engineer - Intern (Summer 2026)',
        company: microsoftCompany._id,
        companyName: 'Microsoft IDC',
        description: 'Exciting 8-week summer internship developing features for Azure Cloud, Microsoft 365, and Developer Tools.',
        responsibilities: [
          'Build customer-facing web capabilities using modern React and TypeScript.',
          'Implement backend REST services in .NET or Node.js with automated test suites.',
          'Present internship project deliverable to senior engineering leadership.'
        ],
        requirements: [
          'Enrolled in pre-final year B.Tech/B.E. program graduating in 2026 or 2027.',
          'Hands-on experience with modern JavaScript/TypeScript, React, or backend APIs.',
          'Strong problem-solving capability with clear written and verbal communication.'
        ],
        skillsRequired: ['React', 'TypeScript', 'Node.js', 'Azure', 'Git'],
        jobType: 'internship',
        workMode: 'hybrid',
        location: 'Hyderabad, Telangana, India',
        salaryOrStipend: {
          min: 80000,
          max: 100000,
          currency: 'INR',
          period: 'monthly',
          isDisclosed: true
        },
        eligibility: {
          minCgpa: 7.5,
          allowedBranches: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
          allowedGraduationYears: [2026, 2027],
          maxBacklogs: 0
        },
        applicationDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        applicationMethod: 'internal',
        drive: summerDrive._id,
        status: 'open',
        sourceProvider: 'direct',
        createdBy: microsoftRecruiter._id,
        isDemo: true
      },
      {
        title: 'Systems Engineer Trainee',
        company: infosysCompany._id,
        companyName: 'Infosys Limited',
        description: 'Comprehensive graduate engineering onboarding program covering enterprise full-stack development, cloud migrations, and cybersecurity.',
        responsibilities: [
          'Participate in foundational training at the Infosys Global Education Center in Mysore.',
          'Assist in code development, unit testing, and deployment for international enterprise clients.'
        ],
        requirements: [
          'B.Tech / B.E. in any recognized engineering discipline.',
          'Basic proficiency in Java, Python, or Web Development.',
          'Excellent communication skills.'
        ],
        skillsRequired: ['Java', 'SQL', 'Python', 'Problem Solving'],
        jobType: 'full-time',
        workMode: 'onsite',
        location: 'Pune / Chennai / Mysore, India',
        salaryOrStipend: {
          min: 450000,
          max: 650000,
          currency: 'INR',
          period: 'yearly',
          isDisclosed: true
        },
        eligibility: {
          minCgpa: 6.5,
          allowedBranches: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering'],
          allowedGraduationYears: [2025, 2026],
          maxBacklogs: 0
        },
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        applicationMethod: 'internal',
        drive: mainDrive._id,
        status: 'open',
        sourceProvider: 'direct',
        createdBy: admin._id,
        isDemo: true
      },
      {
        title: 'Full Stack Web Developer (External Partner Listing)',
        company: null,
        companyName: 'Thoughtworks Technologies',
        description: 'Consultative software engineering position focusing on agile practices, test-driven development, and domain-driven design.',
        responsibilities: [
          'Develop full-stack web applications using React, Node.js, and Postgres.',
          'Advocate for clean code, automated unit testing, and pair programming.'
        ],
        requirements: [
          'Strong command of JavaScript/ES6+, React, and Node.js.',
          'Passion for clean software architecture and continuous integration.'
        ],
        skillsRequired: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'TDD'],
        jobType: 'full-time',
        workMode: 'remote',
        location: 'Bangalore, India (Remote)',
        salaryOrStipend: {
          min: 1200000,
          max: 1600000,
          currency: 'INR',
          period: 'yearly',
          isDisclosed: true
        },
        eligibility: {
          minCgpa: 7.0,
          allowedBranches: [],
          allowedGraduationYears: [2025, 2026],
          maxBacklogs: 0
        },
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        applicationMethod: 'external',
        externalUrl: 'https://www.thoughtworks.com/careers',
        status: 'open',
        sourceProvider: 'seed_demo',
        isDemo: true,
        createdBy: admin._id
      }
    ]);

    console.log('[Seeder] Creating student accounts and profiles...');
    const student1 = await User.create({
      name: 'Alex Chen',
      email: 'student.alex@college.edu',
      password: 'Student@1234Password',
      role: 'student',
      isVerified: true,
      status: 'active',
      phone: '+91 91234 56789'
    });

    const profile1 = await StudentProfile.create({
      user: student1._id,
      fullName: 'Alex Chen',
      collegeEmail: 'student.alex@college.edu',
      university: 'National Institute of Technology',
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      graduationYear: 2026,
      cgpa: 9.2,
      backlogs: 0,
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Data Structures', 'Algorithms', 'Docker', 'AWS'],
      projects: [
        {
          title: 'Distributed File Storage Engine',
          description: 'A fault-tolerant distributed storage cluster with raft consensus and client-side encryption.',
          techStack: ['Go', 'gRPC', 'Raft', 'Docker'],
          githubLink: 'https://github.com/alexchen/distributed-storage'
        },
        {
          title: 'Campus Food Delivery Platform',
          description: 'Full-stack mobile-responsive application facilitating hostel cafeteria order scheduling.',
          techStack: ['React', 'Express', 'MongoDB', 'Tailwind CSS'],
          link: 'https://campus-food.example.com',
          githubLink: 'https://github.com/alexchen/campus-food'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          issueDate: '2024-08',
          credentialUrl: 'https://aws.amazon.com'
        }
      ],
      workExperience: [
        {
          role: 'Software Engineering Intern',
          company: 'FinTech Innovations Lab',
          startDate: 'May 2024',
          endDate: 'July 2024',
          isCurrent: false,
          description: 'Built high-throughput payment reconciliation microservice reducing settlement delay by 35%.'
        }
      ],
      githubUrl: 'https://github.com/alexchen',
      linkedinUrl: 'https://linkedin.com/in/alexchen-dev',
      portfolioUrl: 'https://alexchen.dev',
      bio: 'Final year CSE undergraduate enthusiastic about scalable backend architecture and distributed systems.',
      phone: '+91 91234 56789'
    });

    const student2 = await User.create({
      name: 'Priya Patel',
      email: 'student.priya@college.edu',
      password: 'Student@1234Password',
      role: 'student',
      isVerified: true,
      status: 'active',
      phone: '+91 92345 67890'
    });

    const profile2 = await StudentProfile.create({
      user: student2._id,
      fullName: 'Priya Patel',
      collegeEmail: 'student.priya@college.edu',
      university: 'National Institute of Technology',
      degree: 'B.Tech',
      branch: 'Information Technology',
      graduationYear: 2026,
      cgpa: 8.7,
      backlogs: 0,
      skills: ['React', 'JavaScript', 'Python', 'Machine Learning', 'Tailwind CSS', 'SQL'],
      projects: [
        {
          title: 'Medical Image Segmentation Using U-Net',
          description: 'Automated tumor boundary delineation using deep learning convolutional networks.',
          techStack: ['Python', 'PyTorch', 'OpenCV'],
          githubLink: 'https://github.com/priyapatel/unet-segmentation'
        }
      ],
      githubUrl: 'https://github.com/priyapatel',
      linkedinUrl: 'https://linkedin.com/in/priya-patel',
      bio: 'Passionate about applying modern web technologies and applied artificial intelligence to healthcare products.',
      phone: '+91 92345 67890'
    });

    const student3 = await User.create({
      name: 'Rahul Varma',
      email: 'student.rahul@college.edu',
      password: 'Student@1234Password',
      role: 'student',
      isVerified: true,
      status: 'active',
      phone: '+91 93456 78901'
    });

    await StudentProfile.create({
      user: student3._id,
      fullName: 'Rahul Varma',
      collegeEmail: 'student.rahul@college.edu',
      university: 'National Institute of Technology',
      degree: 'B.Tech',
      branch: 'Electronics & Communication',
      graduationYear: 2026,
      cgpa: 7.2,
      backlogs: 1, // Has 1 active backlog for testing eligibility criteria
      skills: ['C++', 'Embedded Systems', 'IoT', 'Python', 'Microcontrollers'],
      projects: [
        {
          title: 'Smart Campus Energy Metering',
          description: 'ESP32 IoT sensor network monitoring real-time power dissipation across college labs.',
          techStack: ['C++', 'ESP32', 'MQTT', 'InfluxDB'],
          githubLink: 'https://github.com/rahulvarma/smart-meter'
        }
      ],
      githubUrl: 'https://github.com/rahulvarma',
      bio: 'Hardware enthusiast exploring the intersection of IoT and distributed firmware.'
    });

    console.log('[Seeder] Creating realistic applications and interview records...');
    // Alex applied to Google (Shortlisted)
    const googleJob = jobs[0];
    const msJob = jobs[1];

    const app1 = await Application.create({
      job: googleJob._id,
      student: student1._id,
      profileSnapshot: {
        fullName: profile1.fullName,
        collegeEmail: profile1.collegeEmail,
        degree: profile1.degree,
        branch: profile1.branch,
        graduationYear: profile1.graduationYear,
        cgpa: profile1.cgpa,
        backlogs: profile1.backlogs,
        skills: profile1.skills,
        phone: profile1.phone
      },
      eligibilitySnapshot: {
        isEligible: true,
        reasons: [],
        evaluatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      status: 'interview_scheduled',
      statusHistory: [
        { status: 'applied', changedBy: student1._id, note: 'Applied via PlacementOS', changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { status: 'under_review', changedBy: googleRecruiter._id, note: 'Resume reviewed and matches team criteria.', changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { status: 'shortlisted', changedBy: googleRecruiter._id, note: 'Shortlisted for technical rounds.', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: 'interview_scheduled', changedBy: googleRecruiter._id, note: 'Technical Interview Round 1 scheduled.', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
      ],
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });
    googleJob.applicationsCount = 1;
    await googleJob.save();

    // Schedule interview for app1
    await Interview.create({
      application: app1._id,
      job: googleJob._id,
      student: student1._id,
      recruiter: googleRecruiter._id,
      roundName: 'Technical Round 1: Algorithms & Systems',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      durationMinutes: 60,
      mode: 'online',
      meetingLinkOrLocation: 'https://meet.google.com/placementos-google-alex',
      notes: 'Focus on distributed data structures, concurrency, and tree traversals.',
      status: 'scheduled'
    });

    // Priya applied to Microsoft (Under Review)
    const app2 = await Application.create({
      job: msJob._id,
      student: student2._id,
      profileSnapshot: {
        fullName: profile2.fullName,
        collegeEmail: profile2.collegeEmail,
        degree: profile2.degree,
        branch: profile2.branch,
        graduationYear: profile2.graduationYear,
        cgpa: profile2.cgpa,
        backlogs: profile2.backlogs,
        skills: profile2.skills,
        phone: profile2.phone
      },
      eligibilitySnapshot: {
        isEligible: true,
        reasons: [],
        evaluatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      status: 'under_review',
      statusHistory: [
        { status: 'applied', changedBy: student2._id, note: 'Applied via PlacementOS', changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { status: 'under_review', changedBy: microsoftRecruiter._id, note: 'Candidate under preliminary portfolio review.', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
      ],
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });
    msJob.applicationsCount = 1;
    await msJob.save();

    // Alex saved Microsoft job
    await SavedJob.create({
      student: student1._id,
      job: msJob._id,
      savedAt: new Date()
    });

    // Initial audit log
    await AuditLog.create({
      user: admin._id,
      userEmail: admin.email,
      role: 'admin',
      action: 'SYSTEM_SEEDED',
      resourceType: 'System',
      resourceId: 'initial-seed',
      details: { environment: 'development', recordsCreated: 'users, companies, jobs, applications' }
    });

    console.log('===========================================================');
    console.log('  PlacementOS Database Seeded Successfully!');
    console.log('===========================================================');
    console.log('  Accounts Provisioned:');
    console.log('  1. Administrator:');
    console.log('     Email: admin@college.edu');
    console.log('     Password: Admin@1234Password');
    console.log('  2. Recruiter (Google India - Verified):');
    console.log('     Email: recruiter.google@placementos.edu');
    console.log('     Password: Recruiter@1234Password');
    console.log('  3. Recruiter (Microsoft IDC - Verified):');
    console.log('     Email: recruiter.ms@placementos.edu');
    console.log('     Password: Recruiter@1234Password');
    console.log('  4. Recruiter (Apex AI - Pending Verification Demo):');
    console.log('     Email: pending.recruiter@apexai.example.com');
    console.log('     Password: Recruiter@1234Password');
    console.log('  5. Student (Alex Chen - CS, CGPA 9.2):');
    console.log('     Email: student.alex@college.edu');
    console.log('     Password: Student@1234Password');
    console.log('  6. Student (Priya Patel - IT, CGPA 8.7):');
    console.log('     Email: student.priya@college.edu');
    console.log('     Password: Student@1234Password');
    console.log('  7. Student (Rahul Varma - ECE, 1 Backlog):');
    console.log('     Email: student.rahul@college.edu');
    console.log('     Password: Student@1234Password');
    console.log('===========================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
