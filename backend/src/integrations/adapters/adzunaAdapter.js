const axios = require('axios');
const BaseAdapter = require('./baseAdapter');
const env = require('../../config/env');

class AdzunaAdapter extends BaseAdapter {
  constructor() {
    super('Adzuna Jobs & Internships', 'adzuna');
    this.appId = env.ADZUNA_APP_ID;
    this.apiKey = env.ADZUNA_API_KEY;
    this.country = 'in'; // default India
    this.baseUrl = 'https://api.adzuna.com/v1/api/jobs';
  }

  isConfigured() {
    return Boolean(this.appId && this.apiKey && this.appId.trim() !== '' && this.apiKey.trim() !== '');
  }

  /**
   * Fetch listings from Adzuna API
   */
  async fetchOpportunities({ country = 'in', query = 'software engineer intern developer', page = 1, resultsPerPage = 20 } = {}) {
    if (!this.isConfigured()) {
      throw new Error('Adzuna API credentials missing. Please configure ADZUNA_APP_ID and ADZUNA_API_KEY in your .env file or admin settings.');
    }

    const targetCountry = country || this.country;
    const url = `${this.baseUrl}/${targetCountry}/search/${page}`;

    const params = {
      app_id: this.appId,
      app_key: this.apiKey,
      what: query,
      results_per_page: resultsPerPage,
      'content-type': 'application/json'
    };

    const fetchAction = async () => {
      const response = await axios.get(url, {
        params,
        timeout: 10000,
        headers: {
          'User-Agent': 'PlacementOS-SyncEngine/1.0'
        }
      });
      return response.data;
    };

    const data = await this.retryOperation(fetchAction, 3, 1500);

    if (!data || !data.results) {
      return [];
    }

    return data.results.map(item => this.normalizeListing(item, targetCountry));
  }

  /**
   * Normalizes Adzuna listing into PlacementOS Job format
   */
  normalizeListing(item, country) {
    const defaultDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // Extract skills from description / title
    const techKeywords = ['React', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'MongoDB', 'AWS', 'C++', 'Git', 'REST API', 'Docker', 'HTML', 'CSS'];
    const matchedSkills = techKeywords.filter(kw => 
      (item.title + ' ' + (item.description || '')).toLowerCase().includes(kw.toLowerCase())
    );

    const isInternship = /intern|trainee|apprentice/i.test(item.title || '') || /intern/i.test(item.category?.label || '');

    return {
      title: item.title ? item.title.replace(/<\/?[^>]+(>|$)/g, '') : 'Software Developer Opportunity',
      companyName: item.company?.display_name || 'Technology Company',
      companyLogo: '',
      description: item.description ? item.description.replace(/<\/?[^>]+(>|$)/g, '') : 'Opportunity sourced via Adzuna API.',
      responsibilities: [
        'Collaborate with cross-functional engineering and product teams.',
        'Develop, test, and maintain robust and scalable software solutions.',
        'Participate in code reviews, design discussions, and sprint planning.'
      ],
      requirements: [
        'Bachelor\'s or Master\'s degree in Computer Science, IT, or related technical field.',
        'Proficiency in core programming fundamentals and data structures.',
        'Strong problem-solving attitude and collaborative mindset.'
      ],
      skillsRequired: matchedSkills.length > 0 ? matchedSkills : ['JavaScript', 'React', 'Problem Solving'],
      jobType: isInternship ? 'internship' : 'full-time',
      workMode: /remote|telecommute/i.test(item.title + ' ' + (item.description || '')) ? 'remote' : 'onsite',
      location: item.location?.display_name || (country === 'in' ? 'Bangalore, India' : 'Multiple Locations'),
      salaryOrStipend: {
        min: item.salary_min ? Math.round(item.salary_min) : 0,
        max: item.salary_max ? Math.round(item.salary_max) : (item.salary_min ? Math.round(item.salary_min) : 0),
        currency: country === 'in' ? 'INR' : 'USD',
        period: isInternship ? 'monthly' : 'yearly',
        isDisclosed: Boolean(item.salary_min || item.salary_max)
      },
      eligibility: {
        minCgpa: 6.5,
        allowedBranches: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Electrical Engineering'],
        allowedGraduationYears: [2025, 2026, 2027],
        maxBacklogs: 0
      },
      applicationOpeningDate: item.created ? new Date(item.created) : new Date(),
      applicationDeadline: defaultDeadline,
      applicationMethod: 'external',
      externalUrl: item.redirect_url || '',
      status: 'open',
      sourceProvider: 'adzuna',
      externalId: String(item.id),
      isDemo: false,
      lastVerifiedAt: new Date()
    };
  }
}

module.exports = AdzunaAdapter;
