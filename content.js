// Function to add a checkbox to an article row
function addCheckboxToArticle(article) {
  // Find the title element within the article row
  const titleElement = article.querySelector('.titleline > a');

  // The metadata (including comments link) is in the *next* table row
  const subtextRow = article.nextElementSibling;

  if (!titleElement || !subtextRow) {
    return; // Skip if it's not a standard article post
  }

  // Find the comment link specifically
  // We look for a link that goes to 'item?id=' and contains 'comment' or 'discuss'
  const allSublinks = subtextRow.querySelectorAll('.subline a');
  const commentLink = Array.from(allSublinks).find(a =>
    a.href.includes('item?id=') &&
    (a.textContent.includes('comment') || a.textContent.includes('discuss'))
  );

  // We must have a title and a comment link to proceed
  if (!commentLink) {
    return; // Skip items with no comment link (e.g., jobs)
  }

  // Create the checkbox element
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.style.marginRight = '8px';
  checkbox.style.verticalAlign = 'middle';
  checkbox.dataset.url = titleElement.href; // Store url for later check

  // Check storage to see if this article is already saved
  chrome.storage.local.get({ savedArticles: [] }, (result) => {
    const isSaved = result.savedArticles.some(a => a.url === titleElement.href);
    if (isSaved) {
      checkbox.checked = true;
    }
  });

  // Add event listener for when the checkbox state changes
  checkbox.addEventListener('change', (event) => {
    const articleData = {
      title: titleElement.innerText,
      url: titleElement.href,
      comments: commentLink.href, // Use the full href from the found link
      savedAt: new Date().toISOString()
    };

    if (event.target.checked) {
      // Add the article to storage
      chrome.storage.local.get({ savedArticles: [] }, (result) => {
        const savedArticles = result.savedArticles;
        // Avoid adding duplicates
        if (!savedArticles.some(a => a.url === articleData.url)) {
          savedArticles.push(articleData);
          chrome.storage.local.set({ savedArticles });
        }
      });
    } else {
      // Remove the article from storage
      chrome.storage.local.get({ savedArticles: [] }, (result) => {
        let savedArticles = result.savedArticles;
        savedArticles = savedArticles.filter(a => a.url !== articleData.url);
        chrome.storage.local.set({ savedArticles });
      });
    }
  });

  // Insert the checkbox before the title link
  article.querySelector('.title').insertAdjacentElement('afterbegin', checkbox);
}

// Run the script on all initial article rows
document.querySelectorAll('tr.athing').forEach(addCheckboxToArticle);
