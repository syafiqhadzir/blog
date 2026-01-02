module.exports = {
    ci: {
        assert: {
            // Performance budgets aligned with Web Core Vitals
            assertions: {
                'categories:accessibility': ['error', { minScore: 0.95 }],
                'categories:best-practices': ['error', { minScore: 1 }],
                // Core Web Vitals (Realistic threshold for CI)
                'categories:performance': ['error', { minScore: 0.9 }],
                'categories:seo': ['error', { minScore: 1 }],

                // Performance & Budgets
                'color-contrast': 'off', // AMP handles this differently
                'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
                'duplicated-javascript': 'off',
                'duplicated-javascript-insight': 'off',
                'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
                'label-content-name-mismatch': 'warn',
                'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
                'total-blocking-time': ['warn', { maxNumericValue: 300 }],
                'unused-javascript': 'off',

                // Best practices
                'uses-http2': 'warn',
                'uses-long-cache-ttl': 'warn',
            },
        },
        collect: {
            // Number of runs per URL for accuracy
            numberOfRuns: 3,
            // Lighthouse settings
            settings: {
                // AMP pages need special handling
                formFactor: 'mobile',
                // Skip tests that don't apply to AMP
                onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
                throttlingMethod: 'simulate',
            },
            // Use static server for the built site
            staticDistDir: './_site',
            // URLs to test
            url: ['http://localhost/index.html', 'http://localhost/about.html', 'http://localhost/archive.html'],
        },
        upload: {
            // Upload to temporary public storage (free)
            target: 'temporary-public-storage',
        },
    },
};
