document.addEventListener("DOMContentLoaded", () => {
  // -------- Elements --------
  const html = document.documentElement;
  const toggleBtn = document.getElementById("toggle-mode");
  const summarizeBtn = document.getElementById("summarize-btn");
  const copyBtn = document.getElementById("copy-btn");
  const result = document.getElementById("result");
  const apiStatusDiv = document.getElementById("api-status");

  const typeSelect = document.getElementById("select-type");
  const providerSelect = document.getElementById("provider-select");

  // Theme‐toggle elements
  const themeText = toggleBtn.querySelector("span#theme-text");
  const themeIcon = toggleBtn.querySelector("img#theme-icon");

  // Placeholder message
  const DEFAULT_MESSAGE = "Select a type and AI model to continue!";
  result.textContent = DEFAULT_MESSAGE;

  // -------- Initialize Theme --------
  if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "dark");
  }
  html.classList.toggle("dark", localStorage.getItem("theme") === "dark");

  function updateThemeButton() {
    if (html.classList.contains("dark")) {
      themeText.textContent = "Light";
      themeIcon.src = "/assets/images/brightness.png";
      themeIcon.alt = "Switch to Light Mode";
      toggleBtn.classList.remove("light-mode");
      toggleBtn.classList.add("dark-mode");
    } else {
      themeText.textContent = "Dark";
      themeIcon.src = "/assets/images/sun.png";
      themeIcon.alt = "Switch to Dark Mode";
      toggleBtn.classList.remove("dark-mode");
      toggleBtn.classList.add("light-mode");
    }
  }
  updateThemeButton();

  toggleBtn.addEventListener("click", () => {
    html.classList.toggle("dark");
    localStorage.setItem("theme", html.classList.contains("dark") ? "dark" : "light");
    updateThemeButton();
  });

  // -------- Disable Buttons Initially --------
  summarizeBtn.disabled = true;
  summarizeBtn.classList.add("opacity-50", "cursor-not-allowed");
  copyBtn.disabled = true;
  copyBtn.classList.add("opacity-50", "cursor-not-allowed");

  // -------- Track Which Keys Exist --------
  let hasGeminiKey = false;
  // let hasOpenAIKey = false;
  let hasHuggingFaceKey = false;

  // Whenever the user changes “Type” or “Provider,” re‐evaluate the Summarize button
  function checkEnableSummarize() {
    const chosenType = typeSelect.value;
    const chosenProvider = providerSelect.value;

    if (!chosenType || !chosenProvider) {
      summarizeBtn.disabled = true;
      summarizeBtn.classList.add("opacity-50", "cursor-not-allowed");
      return;
    }

    // If they chose Gemini → require Gemini key; if Hugging Face → require Hugging Face key
    if (chosenProvider === "gemini" && hasGeminiKey) {
      summarizeBtn.disabled = false;
      summarizeBtn.classList.remove("opacity-50", "cursor-not-allowed");
    } else if (chosenProvider === "huggingface" && hasHuggingFaceKey) {
      summarizeBtn.disabled = false;
      summarizeBtn.classList.remove("opacity-50", "cursor-not-allowed");
    } else {
      // They picked a provider for which no key exists → stay disabled
      summarizeBtn.disabled = true;
      summarizeBtn.classList.add("opacity-50", "cursor-not-allowed");
    }

    // If you re‐select a type/provider, remove old result & disable Copy
    result.textContent = DEFAULT_MESSAGE;
    copyBtn.disabled = true;
    copyBtn.classList.add("opacity-50", "cursor-not-allowed");
  }
  typeSelect.addEventListener("change", checkEnableSummarize);
  providerSelect.addEventListener("change", checkEnableSummarize);

  // -------- Render API Status & Record Which Keys Exist --------
  chrome.storage.sync.get(["geminiAPIKey", "huggingfaceAPIKey"], ({ geminiAPIKey, huggingfaceAPIKey }) => {
    hasGeminiKey = Boolean(geminiAPIKey);
    // hasOpenAIKey = Boolean(openaiAPIKey);
    hasHuggingFaceKey = Boolean(huggingfaceAPIKey);
    apiStatusDiv.innerHTML = "";

    // Helper: “Settings” button markup
    function showSettingsButton() {
      apiStatusDiv.innerHTML = `
        <button id="go-settings" class="go-settings">
          <svg xmlns="http://www.w3.org/2000/svg"
               class="h-4 w-4 flex-shrink-0"
               fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Settings
        </button>`;
      document.getElementById("go-settings").addEventListener("click", () => {
        chrome.runtime.openOptionsPage();
      });
    }

    // CASE 1: Neither key present
    if (!hasGeminiKey && !hasHuggingFaceKey) {
      showSettingsButton();

      // Summarize must remain disabled if no keys
      summarizeBtn.disabled = true;
      summarizeBtn.classList.add("opacity-50", "cursor-not-allowed");

    // CASE 2: Exactly one key present
    } else if ((hasGeminiKey && !hasHuggingFaceKey) || (hasHuggingFaceKey && !hasGeminiKey)) {
      apiStatusDiv.innerHTML = `
        <span class="connected">
          <svg xmlns="http://www.w3.org/2000/svg"
               class="h-4 w-4 flex-shrink-0"
               fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M5 13l4 4L19 7" />
          </svg>
          API Connected
        </span>`;
      showSettingsButton();

      // Summarize still disabled until they pick a matching provider
      summarizeBtn.disabled = true;
      summarizeBtn.classList.add("opacity-50", "cursor-not-allowed");

    // CASE 3: Both keys present
    } else {
      apiStatusDiv.innerHTML = `
        <span class="connected">
          <svg xmlns="http://www.w3.org/2000/svg"
               class="h-4 w-4 flex-shrink-0"
               fill="none" viewBox="0 0 24 24"
               stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M5 13l4 4L19 7" />
          </svg>
          APIs Connected
        </span>`;

      // Now that keys exist, let checkEnableSummarize handle enabling when they pick type+provider
    }

    // Finally, run checkEnableSummarize once in case they already have defaults chosen
    checkEnableSummarize();
  });

  // -------- SUMMARIZE BUTTON CLICK --------
  summarizeBtn.addEventListener("click", async () => {
    const summaryType = typeSelect.value;            // “brief” / “detailed” / “bullets”
    const provider = providerSelect.value;           // “gemini” / “openai”
    const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = activeTabs[0];
    if (!activeTab?.id) return;

    // If they somehow clicked despite missing key, show an error
    if (provider === "gemini" && !hasGeminiKey) {
      result.textContent = "Cannot summarize with Gemini: no Gemini API key available.";
      return;
    }
    if (provider === "huggingface" && !hasHuggingFaceKey) {
      result.textContent = "Cannot summarize with Hugging Face: no Hugging Face API key available.";
      return;
    }
    
    result.textContent = "🔧 Generating summary…";
    copyBtn.disabled = true;
    copyBtn.classList.add("opacity-50", "cursor-not-allowed");

    chrome.tabs.sendMessage(activeTab.id, { type: "GET_ARTICLE_TEXT" }, async (response) => {
      const pageText = response?.text;
      if (!pageText) {
        result.textContent = "No readable article found.";
        return;
      }

      try {
        let summary = "";
        if (provider === "gemini") {
          // Fetch Gemini summary
          chrome.storage.sync.get(["geminiAPIKey"], async ({ geminiAPIKey }) => {
            summary = await getGeminiSummary(pageText, summaryType, geminiAPIKey);
            result.textContent = summary;
            copyBtn.disabled = false;
            copyBtn.classList.remove("opacity-50", "cursor-not-allowed");
          });
        } else {
          // Fetch OpenAI summary
          // chrome.storage.sync.get(["openaiAPIKey"], async ({ openaiAPIKey }) => {
          //   summary = await getOpenAISummary(pageText, summaryType, openaiAPIKey);
          //   result.textContent = summary;
          //   copyBtn.disabled = false;
          //   copyBtn.classList.remove("opacity-50", "cursor-not-allowed");
          // });

          // Fetch Hugging Face summary
          chrome.storage.sync.get(["huggingfaceAPIKey"], async ({ huggingfaceAPIKey }) => {
            summary = await getHuggingFaceSummary(pageText, summaryType, huggingfaceAPIKey);
            result.textContent = summary;
            copyBtn.disabled = false;
            copyBtn.classList.remove("opacity-50", "cursor-not-allowed");
          });
        }
      } catch (err) {
        result.textContent =
          provider === "gemini"
            ? "Gemini error: " + err.message
            // : "OpenAI error: " + err.message;
            : "Hugging Face error: " + err.message;
      }
    });
  });

  // -------- COPY BUTTON CLICK --------
  copyBtn.addEventListener("click", () => {
    const currentText = result.innerText.trim();
    if (!currentText || currentText === DEFAULT_MESSAGE) {
      alert("First generate a summary before copying.");
      return;
    }
    navigator.clipboard.writeText(currentText).then(() => {
      const original = copyBtn.textContent;
      copyBtn.textContent = "✅ Copied!";
      setTimeout(() => (copyBtn.textContent = original), 500);
    });
  });
});


// ======== Gemini Summarization (unchanged) ========
async function getGeminiSummary(rawText, type, apiKey) {
  const max = 50000;
  const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;
  const promptMap = {
    brief: `Summarize in 2-3 sentences:\n\n${text}`,
    detailed: `Give a detailed summary:\n\n${text}`,
    bullets: `Summarize in 7-8 bullet points (start each line with "- "):\n\n${text}`,
  };
  const prompt = promptMap[type];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  );
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error?.message || "Request Failed");
  }
  const data = await res.json();
  return data.candidates[0].content.parts[0]?.text ?? "No summary.";
}


// ======== OpenAI Summarization ========
// async function getOpenAISummary(rawText, type, apiKey) {
//   const maxTokens = 100; // adjust as needed
//   const text = rawText.length > maxTokens ? rawText.slice(0, maxTokens) + "..." : rawText;
//   const promptMap = {
//     brief: `Please provide a concise summary in 2-3 sentences:\n\n${text}`,
//     detailed: `Please provide a detailed summary:\n\n${text}`,
//     bullets: `Please summarize into 7-8 bullet points (each line starting with "- "):\n\n${text}`,
//   };
//   const prompt = promptMap[type] || promptMap.brief;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${apiKey}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: "You are a helpful assistant that summarizes text." },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0.2,
//       max_tokens: 1000,
//     }),
//   });

//   if (!response.ok) {
//     const errJson = await response.json();
//     throw new Error(errJson.error?.message || "OpenAI request failed");
//   }

//   const data = await response.json();
//   return data.choices[0].message.content.trim() || "No summary.";
// }

// ======== Hugging Face Summarization ========
// this func does not summarized based on the type of summary, it just returns the summary
// async function getHuggingFaceSummary(rawText, type, apiKey) {
//   const max = 1050;
//   const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;

//   const promptMap = {
//     brief: `Summarize this in 2-3 sentences:\n\n${text}`,
//     detailed: `Provide a detailed summary:\n\n${text}`,
//     bullets: `Summarize this into bullet points. Start each point with "- ":\n\n${text}`,
//   };

//   const prompt = promptMap[type];

//   const response = await fetch(
//     "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn",
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ inputs: prompt }),
//     }
//   );

//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error?.error || "Hugging Face request failed");
//   }

//   const result = await response.json();
//   return result?.[0]?.summary_text || "No summary returned.";
// }

async function getHuggingFaceSummary(rawText, type, apiKey) {
  const max = 1050;
  const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;

  // Define models per summary type
  const modelMap = {
    brief: "sshleifer/distilbart-xsum-12-6",
    detailed: "sshleifer/distilbart-cnn-12-6",
    bullets: "sshleifer/distilbart-cnn-12-6", // same model, we'll post-process output
  };

  const model = modelMap[type];
  const url = `https://api-inference.huggingface.co/models/${model}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || "Hugging Face request failed");
  }

  const result = await response.json();
  let summary = result?.[0]?.summary_text || "No summary returned.";

  // Post-process for bullets
  if (type === "bullets") {
    // Convert the summary into bullet points (split by sentence)
    summary = summary
      .split(/(?<=[.?!])\s+(?=[A-Z])/)
      .filter((line) => line.trim().length > 0)
      .slice(0, 8)
      .map((line) => `- ${line.trim()}`)
      .join("\n");
  }

  return summary;
}