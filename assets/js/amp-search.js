const searchInput = document.querySelector('#global-search-input');
const resultsContainer = document.querySelector('#global-search-results');
const endpointInput = document.querySelector('#search-endpoint');
let searchData = [];

// Fetch data immediately
if (endpointInput) {
  try {
    const response = await fetch(endpointInput.value);
    const data = await response.json();
    searchData = data.items || [];
  } catch (error) {
    if (resultsContainer) {
      resultsContainer.innerHTML =
        '<div class="search-message">Error loading search data</div>';
    }
    process.stderr.write(`Search data load failed: ${String(error)}\n`);
  }
}
searchInput.addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase().trim();

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
        (item.tags &&
          item.tags.some((tag) => tag.toLowerCase().includes(query))),
    )
    .slice(0, 10);

  if (results.length === 0) {
    resultsContainer.innerHTML =
      '<div class="search-message">No results found</div>';
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
