class BaseAdapter {
  constructor(name, providerKey) {
    this.name = name;
    this.providerKey = providerKey;
  }

  /**
   * Check if adapter has required credentials configured
   * @returns {boolean}
   */
  isConfigured() {
    throw new Error('isConfigured() must be implemented by adapter subclass');
  }

  /**
   * Fetch opportunities from provider API
   * @param {Object} options
   * @returns {Promise<Array>} Array of normalized job objects
   */
  async fetchOpportunities(options = {}) {
    throw new Error('fetchOpportunities() must be implemented by adapter subclass');
  }

  /**
   * Exponential backoff retry wrapper
   */
  async retryOperation(operation, maxRetries = 3, delayMs = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err) {
        lastError = err;
        console.warn(`[${this.name}] Attempt ${attempt} failed: ${err.message}. Retrying in ${delayMs}ms...`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          delayMs *= 2;
        }
      }
    }
    throw lastError;
  }
}

module.exports = BaseAdapter;
