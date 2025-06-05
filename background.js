chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(
    ["geminiAPIKey", "openaiAPIKey"],
    ({ geminiAPIKey, openaiAPIKey }) => {
      // If neither key is set, open the options page on install
      if (!geminiAPIKey && !openaiAPIKey) {
        chrome.tabs.create({ url: "options.html" });
      }
    }
  );
});
