// Function to add a checkbox to an article row
function addCheckboxToArticle(article) {
  // Find the title element within the article row
  const titleElement = article.querySelector('span.titleline > a');

  // The metadata is in the *next* table row
  const subtextRow = article.nextElementSibling;

  if (!titleElement || !subtextRow) {
    return; // Not a standard article post
  }

  // --- DEFINITIVE FIX ---
  // Instead of guessing the position, we now search for the link by its text.
  const allSublinks = subtextRow.querySelectorAll('.subline a');
  const commentLink = Array.from(allSublinks).find(link =>
    link.textContent.includes('comment') || link.textContent.includes('discuss')
  );

  // If no link with that text is found, we safely skip this row.
  if (!commentLink) {
    return;
  }
  // --- END OF FIX ---

  // Create the checkbox element
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.style.marginRight = '8px';
  checkbox.style.verticalAlign = 'middle';
  checkbox.dataset.url = titleElement.href;

  // Check storage to see if this article is already saved
  chrome.storage.local.get({ savedArticles: [] }, (result) => {
    const isSaved = result.savedArticles.some(a => a.url === titleElement.href);
    if (isSaved) {
      checkbox.checked = true;
    }
  });

  // Add event listener for the checkbox
  checkbox.addEventListener('change', (event) => {
    const articleData = {
      title: titleElement.innerText,
      url: titleElement.href,
      comments: commentLink.href,
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

  // This is the most reliable insertion point: inside the .titleline span, before the main link.
  if (titleElement.parentElement) {
    titleElement.parentElement.insertBefore(checkbox, titleElement);
  }
}

// Run the script on all article rows
document.querySelectorAll('tr.athing').forEach(addCheckboxToArticle);
