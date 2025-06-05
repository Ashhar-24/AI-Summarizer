// document.addEventListener("DOMContentLoaded", () => {
//   const html = document.documentElement;
//   const toggleBtn = document.getElementById("toggle-mode");
//   const summarizeBtn = document.getElementById("summarize-btn");
//   const copyBtn = document.getElementById("copy-btn");
//   const result = document.getElementById("result");
//   const apiStatusDiv = document.getElementById("api-status");

//   // Theme-toggle elements
//   const themeText = toggleBtn.querySelector("span#theme-text");
//   const themeIcon = toggleBtn.querySelector("img#theme-icon");

//   // 1. Default “no summary” message
//   result.textContent = "Select a type and click to see the Summary!";

//   // 2. Initialize light/dark from localStorage (default to dark)
//   if (!localStorage.getItem("theme")) {
//     localStorage.setItem("theme", "dark");
//   }
//   if (localStorage.getItem("theme") === "dark") {
//     html.classList.add("dark");
//   }
//   function updateThemeButton() {
//     if (html.classList.contains("dark")) {
//       themeText.textContent = "Light";
//       themeIcon.src = "brightness.png";
//       themeIcon.alt = "Switch to Light Mode";
//       toggleBtn.classList.remove("light-mode");
//       toggleBtn.classList.add("dark-mode");
//     } else {
//       themeText.textContent = "Dark";
//       themeIcon.src = "sun.png";
//       themeIcon.alt = "Switch to Dark Mode";
//       toggleBtn.classList.remove("dark-mode");
//       toggleBtn.classList.add("light-mode");
//     }
//   }
//   updateThemeButton();
//   toggleBtn.addEventListener("click", () => {
//     html.classList.toggle("dark");
//     localStorage.setItem("theme", html.classList.contains("dark") ? "dark" : "light");
//     updateThemeButton();
//   });

//     // 3. Disable Copy button by default
//   copyBtn.disabled = true;
//   copyBtn.classList.add("opacity-50", "cursor-not-allowed");

//   // 3. Check for stored Gemini API key and render status badge/button
//   chrome.storage.sync.get(["geminiAPIKey"], ({ geminiAPIKey }) => {
//     apiStatusDiv.innerHTML = ""; // clear existing content

//     if (geminiAPIKey) {
//       // A. Show green “API Connected” badge
//       apiStatusDiv.innerHTML = `
//         <span class="connected">
//           <svg xmlns="http://www.w3.org/2000/svg"
//                class="h-4 w-4 flex-shrink-0"
//                fill="none" viewBox="0 0 24 24"
//                stroke="currentColor" stroke-width="2">
//             <path stroke-linecap="round" stroke-linejoin="round"
//                   d="M5 13l4 4L19 7" />
//           </svg>
//           API Connected
//         </span>`;
//       // Summarize button is enabled
//       summarizeBtn.disabled = false;
//       summarizeBtn.classList.remove("opacity-50", "cursor-not-allowed");
//     } else {
//       // B. Show blue “Settings” button that opens options.html
//       apiStatusDiv.innerHTML = `
//         <button id="go-settings" class="go-settings">
//           <svg xmlns="http://www.w3.org/2000/svg"
//                class="h-4 w-4 flex-shrink-0"
//                fill="none" viewBox="0 0 24 24"
//                stroke="currentColor" stroke-width="2">
//             <path stroke-linecap="round" stroke-linejoin="round"
//                   d="M11 17l-5-5m0 0l5-5m-5 5h12" />
//           </svg>
//           Settings
//         </button>`;
//       document.getElementById("go-settings").addEventListener("click", () => {
//         chrome.runtime.openOptionsPage();
//       });
//       // Summarize button is disabled until API key is set
//       summarizeBtn.disabled = true;
//       summarizeBtn.classList.add("opacity-50", "cursor-not-allowed");
//     }

//     // 4. Attach a single “Summarize” click handler now that we know API key status
//     summarizeBtn?.addEventListener("click", () => {
//       const selectType = document.getElementById("select-type").value;
//       result.textContent = "🔧 Generating summary…";

//       // If no API key, this code path won’t run because button was disabled.
//       chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
//         chrome.tabs.sendMessage(tab.id, { type: "GET_ARTICLE_TEXT" }, async (response) => {
//           if (!response?.text) {
//             result.textContent = "No readable article found.";
//             return;
//           }
//           try {
//             const summary = await getSummary(response.text, selectType, geminiAPIKey);
//             result.textContent = summary;
//             // Enable Copy button after successful summary
//             copyBtn.disabled = false;
//             copyBtn.classList.remove("opacity-50", "cursor-not-allowed");
//           } catch (error) {
//             result.textContent = "Gemini error: " + error.message;
//           }
//         });
//       });
//     });
//   });

//   // 5. “Copy” button still works as before
//   copyBtn?.addEventListener("click", () => {
//     const txt = document.getElementById("result").innerText;
//     if(!txt) return;

//     navigator.clipboard.writeText(txt).then(() => {
//         const btn = document.getElementById("copy-btn");
//         const old = btn.textContent;
//         btn.textContent = "✅ Copied to clipboard!!";
//         setTimeout(() => (btn.textContent = old), 500);
//     });
//   });
// });


// // ——— getSummary (unchanged) ———
// async function getSummary(rawText, type, apiKey) {
//   const max = 50000;
//   const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;

//   const promptMap = {
//     brief: `Summarize in 2-3 sentences:\n\n${text}`,
//     detailed: `Give a detailed summary:\n\n${text}`,
//     bullets: `Summarize in 7-8 bullet points (start each line with "- "):\n\n${text}`,
//   };
//   const prompt = promptMap[type] || promptMap.brief;

//   const res = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         contents: [{ parts: [{ text: prompt }] }],
//         generationConfig: { temperature: 0.2 },
//       }),
//     }
//   );
//   if (!res.ok) {
//     const { error } = await res.json();
//     throw new Error(error?.message || "Request Failed");
//   }
//   const data = await res.json();
//   return data.candidates[0].content.parts[0]?.text ?? "No summary.";
// }

// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const toggleBtn = document.getElementById("toggle-mode");
  const summarizeBtn = document.getElementById("summarize-btn");
  const copyBtn = document.getElementById("copy-btn");
  const result = document.getElementById("result");
  const apiStatusDiv = document.getElementById("api-status");

  // Theme-toggle elements
  const themeText = toggleBtn.querySelector("span#theme-text");
  const themeIcon = toggleBtn.querySelector("img#theme-icon");

  // 1. Default “no summary” message
  const DEFAULT_MESSAGE = "Select a type and click to see the Summary!";
  result.textContent = DEFAULT_MESSAGE;

  // 2. Initialize light/dark from localStorage (default to dark)
  if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "dark");
  }
  if (localStorage.getItem("theme") === "dark") {
    html.classList.add("dark");
  }
  function updateThemeButton() {
    if (html.classList.contains("dark")) {
      themeText.textContent = "Light";
      themeIcon.src = "brightness.png";
      themeIcon.alt = "Switch to Light Mode";
      toggleBtn.classList.remove("light-mode");
      toggleBtn.classList.add("dark-mode");
    } else {
      themeText.textContent = "Dark";
      themeIcon.src = "sun.png";
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

  // 3. Disable Copy button by default
  copyBtn.disabled = true;
  copyBtn.classList.add("opacity-50", "cursor-not-allowed");

  // 4. Check for stored Gemini API key and render status badge/button
  chrome.storage.sync.get(["geminiAPIKey"], ({ geminiAPIKey }) => {
    apiStatusDiv.innerHTML = ""; // clear existing content

    if (geminiAPIKey) {
      // A. Show green “API Connected” badge
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
      // Summarize button is enabled
      summarizeBtn.disabled = false;
      summarizeBtn.classList.remove("opacity-50", "cursor-not-allowed");
    } else {
      // B. Show blue “Settings” button that opens options.html
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
      // Summarize button is disabled until API key is set
      summarizeBtn.disabled = true;
      summarizeBtn.classList.add("opacity-50", "cursor-not-allowed");
    }

    // 5. Attach a single “Summarize” click handler now that we know API key status
    summarizeBtn?.addEventListener("click", () => {
      const selectType = document.getElementById("select-type").value;
      result.textContent = "🔧 Generating summary…";

      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        chrome.tabs.sendMessage(tab.id, { type: "GET_ARTICLE_TEXT" }, async (response) => {
          if (!response?.text) {
            result.textContent = "No readable article found.";
            return;
          }
          try {
            const summary = await getSummary(response.text, selectType, geminiAPIKey);
            result.textContent = summary;

            // Once we have a summary, enable the Copy button
            copyBtn.disabled = false;
            copyBtn.classList.remove("opacity-50", "cursor-not-allowed");
          } catch (error) {
            result.textContent = "Gemini error: " + error.message;
          }
        });
      });
    });
  });

  // 6. “Copy” button behavior
  copyBtn?.addEventListener("click", () => {
    const currentText = result.innerText.trim();
    if (!currentText || currentText === DEFAULT_MESSAGE) {
          // No summary: show feedback for 0.5s
      copyFeedback.classList.remove("hidden");
      setTimeout(() => {
        copyFeedback.classList.add("hidden");
      }, 500);
      return;
    }

    // If there *is* a summary, copy it
    navigator.clipboard.writeText(currentText).then(() => {
      const original = copyBtn.textContent;
      copyBtn.textContent = "✅ Copied to clipboard!";
      setTimeout(() => (copyBtn.textContent = original), 500);
    });
  });
});

// ——— getSummary (unchanged) ———
async function getSummary(rawText, type, apiKey) {
  const max = 50000;
  const text = rawText.length > max ? rawText.slice(0, max) + "..." : rawText;

  const promptMap = {
    brief: `Summarize in 2-3 sentences:\n\n${text}`,
    detailed: `Give a detailed summary:\n\n${text}`,
    bullets: `Summarize in 7-8 bullet points (start each line with "- "):\n\n${text}`,
  };
  const prompt = promptMap[type] || promptMap.brief;

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
