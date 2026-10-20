const axios = require('axios');
const BaseAdapter = require('./baseAdapter');
const env = require('../../config/env');

class USAJobsAdapter extends BaseAdapter {
  constructor() {
    super('USAJobs Federal Careers', 'usajobs');
    this.apiKey = env.USAJOBS_API_KEY;
    this.email = env.USAJOBS_EMAIL;
    this.baseUrl = 'https://data.usajobs.gov/api/search';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.email && this.apiKey.trim() !== '' && this.email.trim() !== '');
  }

  async fetchOpportunities({ keyword = 'software intern', resultsPerPage = 15 } = {}) {
    if (!this.isConfigured()) {
      throw new Error('USAJobs API credentials missing. Please set USAJOBS_API_KEY and USAJOBS_EMAIL in .env.');
    }

    const fetchAction = async () => {
      const response = await axios.get(this.baseUrl, {
        params: {
          Keyword: keyword,
          ResultsPerPage: resultsPerPage
        },
        headers: {
          'Host': 'data.usajobs.gov',
          'User-Agent': this.email,
          'Authorization-Key': this.apiKey
        },
        timeout: 10000
      });
      return response.data;
    };

    const data = await this.retryOperation(fetchAction, 3, 1500);

    if (!data?.SearchResult?.SearchResultItems) {
      return [];
    }

    return data.SearchResult.SearchResultItems.map(item => this.normalizeListing(item));
  }

  normalizeListing(item) {
    const desc = item.MatchedObjectDescriptor;
    return {
      title: desc.PositionTitle || 'Software Position',
      companyName: desc.DepartmentName || desc.OrganizationName || 'Federal Agency',
      companyLogo: '',
      description: desc.UserArea?.Details?.JobSummary || 'Official federal employment opportunity.',
      responsibilities: [
        'Perform systems analysis and software programming tasks.',
        'Collaborate with government engineering teams on public sector technology.'
      ],
      requirements: [
        'U.S. Citizenship or student work eligibility.',
        'Enrolled in or graduated from an accredited degree program in computer science or related field.'
      ],
      skillsRequired: ['Software Engineering', 'Systems Analysis', 'Security'],
      jobType: 'full-time',
      workMode: desc.PositionLocationDisplay?.toLowerCase().includes('telework') ? 'hybrid' : 'onsite',
      location: desc.PositionLocationDisplay || 'United States',
      salaryOrStipend: {
        min: desc.PositionRemuneration?.[0]?.MinimumRange ? Number(desc.PositionRemuneration[0].MinimumRange) : 0,
        max: desc.PositionRemuneration?.[0]?.MaximumRange ? Number(desc.PositionRemuneration[0].MaximumRange) : 0,
        currency: 'USD',
        period: 'yearly',
        isDisclosed: true
      },
      eligibility: {
        minCgpa: 6.0,
        allowedBranches: [],
        allowedGraduationYears: [2025, 2026, 2027],
        maxBacklogs: 0
      },
      applicationOpeningDate: desc.PublicationStartDate ? new Date(desc.PublicationStartDate) : new Date(),
      applicationDeadline: desc.ApplicationCloseDate ? new Date(desc.ApplicationCloseDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      applicationMethod: 'external',
      externalUrl: desc.PositionURI || '',
      status: 'open',
      sourceProvider: 'usajobs',
      externalId: String(item.MatchedObjectId || desc.PositionID),
      isDemo: false,
      lastVerifiedAt: new Date()
    };
  }
}

module.exports = USAJobsAdapter;
