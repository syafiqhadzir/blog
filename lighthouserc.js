module.exports = {
    ci: {
        collect: {
            // Use static server for the built site
            staticDistDir: './_site',
            // URLs to test
            url: [
                'http://localhost/index.html',
                'http://localhost/about.html',
                'http://localhost/archive.html',
            ],
            // Number of runs per URL for accuracy
            numberOfRuns: 3,
            // Lighthouse settings
            settings: {
                // AMP pages need special handling
                emulatedFormFactor: 'mobile',
                throttlingMethod: 'simulate',
                // Skip tests that don't apply to AMP
                onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
            },
        },
        assert: {
            // Performance budgets aligned with Web Core Vitals
            assertions: {
                // Core Web Vitals
                'categories:performance': ['error', { minScore: 0.9 }],
                'categories:accessibility': ['error', { minScore: 0.95 }],
                'categories:best-practices': ['error', { minScore: 0.9 }],
                'categories:seo': ['error', { minScore: 0.95 }],

                // Specific Core Web Vitals metrics
                'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
                'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
                'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
                'total-blocking-time': ['warn', { maxNumericValue: 300 }],

                // Accessibility
                'color-contrast': 'off', // AMP handles this differently

                // Best practices
                'uses-http2': 'warn',
                'uses-long-cache-ttl': 'warn',
            },
        },
        upload: {
            // Upload to temporary public storage (free)
            target: 'temporary-public-storage',
        },
    },
};
