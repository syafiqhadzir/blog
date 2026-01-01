/* eslint-disable */
/* eslint-env browser, worker */
/* global document, fetch */
const searchInput = document.getElementById('global-search-input');
const resultsContainer = document.getElementById('global-search-results');
const endpointInput = document.getElementById('search-endpoint');
let searchData = [];

// Fetch data immediately
if (endpointInput) {
    fetch(endpointInput.value)
        .then((response) => response.json())
        .then((data) => {
            searchData = data.items || [];
        })
        .catch((err) => console.error('Error loading search data:', err));
}

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
        resultsContainer.innerHTML = '';
        return;
    }

    if (searchData.length === 0) {
        resultsContainer.innerHTML = '<div class="search-message">Loading...</div>';
        return;
    }

    const results = searchData
        .filter(
            (item) =>
                (item.title && item.title.toLowerCase().includes(query)) ||
                (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(query))),
        )
        .slice(0, 10);

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-message">No results found</div>';
        return;
    }

    resultsContainer.innerHTML = results
        .map(
            (post) => `
    <div class="search-result-item">
      <a href="${post.url}" class="search-result-link">
        <span class="search-result-title">${post.title}</span>
        <span class="search-result-date">${post.date}</span>
      </a>
    </div>
  `,
        )
        .join('');
});
