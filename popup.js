document.addEventListener('DOMContentLoaded', () => {
  const articleList = document.getElementById('article-list');

  chrome.storage.local.get({ savedArticles: [] }, (result) => {
    let savedArticles = result.savedArticles;

    // Sort articles by most recently saved
    savedArticles.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    if (savedArticles.length > 0) {
      savedArticles.forEach(article => {
        const listItem = document.createElement('li');

        const link = document.createElement('a');
        link.href = article.url;
        link.target = '_blank';
        link.className = 'title';
        link.textContent = article.title;
        link.title = article.title; // Show full title on hover

        const commentsLink = document.createElement('a');
        commentsLink.href = article.comments;
        commentsLink.target = '_blank';
        commentsLink.className = 'comments';
        commentsLink.textContent = 'Comments';

        listItem.appendChild(link);
        listItem.appendChild(commentsLink);
        articleList.appendChild(listItem);
      });
    } else {
      const listItem = document.createElement('li');
      listItem.className = 'no-articles';
      listItem.textContent = 'No articles saved yet.';
      articleList.appendChild(listItem);
    }
  });
});
