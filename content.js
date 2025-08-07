// Function to add a checkbox to an article row
function addCheckboxToArticle(article) {
  const titleElement = article.querySelector('span.titleline > a');
  if (!titleElement) return;

  let articleUrl;
  let commentsUrl;

  // --- NEW LOGIC TO HANDLE BOTH LINK TYPES ---

  // CASE 1: The main link is an internal post (Ask HN, Show HN, Jobs etc.)
  if (titleElement.href.includes('item?id=')) {
    // For these posts, the main link IS the comments page.
    // There is no external article, so we'll point both to the same HN page.
    articleUrl = titleElement.href;
    commentsUrl = titleElement.href;
  }
  // CASE 2: The main link is an external article.
  else {
    articleUrl = titleElement.href;
    const subtextRow = article.nextElementSibling;
    if (!subtextRow) return; // Should not happen, but a good safeguard.

    // For external links, we MUST find a separate "comments" or "discuss" link.
    const allSublinks = subtextRow.querySelectorAll('.subline a');
    const commentLink = Array.from(allSublinks).find(link =>
      link.textContent.includes('comment') || link.textContent.includes('discuss')
    );

    // If no comment link exists for an external article, skip it.
    if (!commentLink) return;
    commentsUrl = commentLink.href;
  }
  // --- END OF NEW LOGIC ---

  // If we got this far, we have valid URLs, so we can create the checkbox.
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.style.marginRight = '8px';
  checkbox.style.verticalAlign = 'middle';
  checkbox.dataset.url = titleElement.href; // Use original href as a unique key

  // Check storage to see if this article is already saved
  chrome.storage.local.get({ savedArticles: [] }, (result) => {
    const isSaved = result.savedArticles.some(a => a.url === articleUrl);
    if (isSaved) {
      checkbox.checked = true;
    }
  });

  // Add event listener for the checkbox
  checkbox.addEventListener('change', (event) => {
    const articleData = {
      title: titleElement.innerText,
      url: articleUrl,
      comments: commentsUrl,
      savedAt: new Date().toISOString()
    };
    if (event.target.checked) {
      chrome.storage.local.get({savedArticles: []}, (result) => {
        const savedArticles = result.savedArticles;
        if (!savedArticles.some(a => a.url === articleData.url)) {
          savedArticles.push(articleData);
          chrome.storage.local.set({savedArticles});
        }
      });
    } else {
      chrome.storage.local.get({savedArticles: []}, (result) => {
        let savedArticles = result.savedArticles;
        savedArticles = savedArticles.filter(a => a.url !== articleData.url);
        chrome.storage.local.set({savedArticles});
      });
    }
  });

  if (titleElement.parentElement) {
    titleElement.parentElement.insertBefore(checkbox, titleElement);
  }
}

// Run the script on all article rows
document.querySelectorAll('tr.athing').forEach(addCheckboxToArticle);
