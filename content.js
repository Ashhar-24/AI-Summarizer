function getArticleText() {
    const docClone = document.implementation.createHTMLDocument();
    docClone.documentElement.innerHTML = document.documentElement.innerHTML;

  // Initialize Readability with the cloned document
  const reader = new Readability(docClone);

  // Parse the document to get article info
  const article = reader.parse();

  // If parsing was successful, return the article content text, else fallback
  if (article && article.textContent) {
    return article.textContent;
  } else {
    // Fallback: try to get all paragraph texts concatenated
    const paragraphs = Array.from(document.querySelectorAll("p"));
    if (paragraphs.length > 0) {
      return paragraphs.map(p => p.innerText).join("\n");
    }
    return "No readable article found";
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if(request.type === 'GET_ARTICLE_TEXT') {
        const text = getArticleText();
        sendResponse({text});
        return true; // Keep the message channel open for sendResponse
    }
});