/**
 * Checks eligibility of a student profile against a job's eligibility criteria
 * @param {Object} studentProfile 
 * @param {Object} job 
 * @returns {Object} { isEligible: boolean, reasons: string[] }
 */
const checkEligibility = (studentProfile, job) => {
  const reasons = [];

  if (!studentProfile) {
    return {
      isEligible: false,
      reasons: ['Student profile has not been initialized. Please complete your academic profile first.']
    };
  }

  const { eligibility = {}, applicationDeadline, status } = job;

  // Check job active status
  if (status !== 'open') {
    reasons.push(`Job listing is currently ${status} and not accepting applications.`);
  }

  // Check deadline
  if (applicationDeadline && new Date() > new Date(applicationDeadline)) {
    reasons.push('Application deadline has passed.');
  }

  // Check CGPA
  if (eligibility.minCgpa > 0) {
    const studentCgpa = Number(studentProfile.cgpa || 0);
    if (studentCgpa < eligibility.minCgpa) {
      reasons.push(`Minimum CGPA requirement is ${eligibility.minCgpa}, but your recorded CGPA is ${studentCgpa}.`);
    }
  }

  // Check allowed branches
  if (eligibility.allowedBranches && eligibility.allowedBranches.length > 0) {
    const studentBranch = (studentProfile.branch || '').trim().toLowerCase();
    const isBranchAllowed = eligibility.allowedBranches.some(
      b => b.trim().toLowerCase() === studentBranch || studentBranch.includes(b.trim().toLowerCase())
    );
    if (!isBranchAllowed) {
      reasons.push(`Your branch (${studentProfile.branch || 'Unspecified'}) is not in the eligible branches list: ${eligibility.allowedBranches.join(', ')}.`);
    }
  }

  // Check graduation year
  if (eligibility.allowedGraduationYears && eligibility.allowedGraduationYears.length > 0) {
    const studentGradYear = Number(studentProfile.graduationYear);
    if (!eligibility.allowedGraduationYears.includes(studentGradYear)) {
      reasons.push(`Your graduation year (${studentGradYear}) is not eligible. Required: ${eligibility.allowedGraduationYears.join(', ')}.`);
    }
  }

  // Check max active backlogs
  if (eligibility.maxBacklogs !== undefined && eligibility.maxBacklogs !== null) {
    const studentBacklogs = Number(studentProfile.backlogs || 0);
    if (studentBacklogs > eligibility.maxBacklogs) {
      reasons.push(`Maximum allowed active backlogs is ${eligibility.maxBacklogs}, but you currently have ${studentBacklogs}.`);
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons
  };
};

module.exports = { checkEligibility };
