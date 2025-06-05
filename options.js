document.addEventListener("DOMContentLoaded", () => {
  // ============
  // Theme Toggle
  // ============
  const html = document.documentElement;
  const toggleBtn = document.getElementById("toggle-mode");
  const themeText = document.getElementById("theme-text");
  const themeIcon = document.getElementById("theme-icon");

  if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "dark");
    html.classList.add("dark");
  }
  const savedTheme = localStorage.getItem("theme");
  html.classList.toggle("dark", savedTheme === "dark");

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
    const isDark = html.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeButton();
  });

  // =================
  // API Key Management
  // =================
  const geminiInput = document.getElementById("gemini-key");
  const openaiInput = document.getElementById("openai-key");
  const saveButton = document.getElementById("save-button");
  const successMsg = document.getElementById("success-message");

  // Helper: insert a single success <p> under a given input element
  function showSuccessForInput(inputId, text) {
    // Create a <p> just above the input, with green text
    const label = document.querySelector(`label[for="${inputId}"]`);
    const message = document.createElement("p");
    message.className = "text-sm text-green-500";
    message.textContent = text;
    // Insert message *after* the label (so it appears in place of the input)
    label.insertAdjacentElement("afterend", message);
  }

  // On load: check storage, hide any input whose key already exists, and show its message
  chrome.storage.sync.get(["geminiAPIKey", "openaiAPIKey"], ({ geminiAPIKey, openaiAPIKey }) => {
    if (geminiAPIKey) {
      // Hide Gemini input & its “Get it from…” paragraph
      document.querySelector('label[for="gemini-key"]').style.display = "none";
      geminiInput.style.display = "none";
      geminiInput.nextElementSibling.style.display = "none"; // the <p> link
      showSuccessForInput("gemini-key", "✅ Gemini API key already saved!");
    }
    if (openaiAPIKey) {
      document.querySelector('label[for="openai-key"]').style.display = "none";
      openaiInput.style.display = "none";
      openaiInput.nextElementSibling.style.display = "none"; // the <p> link
      showSuccessForInput("openai-key", "✅ OpenAI API key already saved!");
    }
  });

  saveButton.addEventListener("click", () => {
    const geminiKey = geminiInput.value.trim();
    const openaiKey = openaiInput.value.trim();

    if (!geminiKey && !openaiKey) {
      alert("Please enter at least one API key.");
      return;
    }

    // Build the storage object
    let keysToSet = {};
    if (geminiKey) keysToSet.geminiAPIKey = geminiKey;
    if (openaiKey) keysToSet.openaiAPIKey = openaiKey;

    chrome.storage.sync.set(keysToSet, () => {
      // Append a message only for the input that was visible (not previously saved)
      if (geminiKey && geminiInput.style.display !== "none") {
        // Hide the input & show “saved” message
        document.querySelector('label[for="gemini-key"]').style.display = "none";
        geminiInput.style.display = "none";
        geminiInput.nextElementSibling.style.display = "none";
        showSuccessForInput("gemini-key", "✅ Gemini API key saved successfully!");
      }
      if (openaiKey && openaiInput.style.display !== "none") {
        document.querySelector('label[for="openai-key"]').style.display = "none";
        openaiInput.style.display = "none";
        openaiInput.nextElementSibling.style.display = "none";
        showSuccessForInput("openai-key", "✅ OpenAI API key saved successfully!");
      }

      // After saving, check if both keys now exist → close window after 1 second
      chrome.storage.sync.get(["geminiAPIKey", "openaiAPIKey"], (res) => {
        if (res.geminiAPIKey && res.openaiAPIKey) {
          setTimeout(() => window.close(), 1000);
        }
      });
    });
  });
});




// -----------------------------------------------------------------

// document.addEventListener("DOMContentLoaded", () => {
//   const html = document.documentElement;
//   const toggleBtn = document.getElementById("toggle-mode");
//   const themeText = document.getElementById("theme-text");
//   const themeIcon = document.getElementById("theme-icon");

//   // If no theme stored yet, default to dark
//   if (!localStorage.getItem("theme")) {
//     localStorage.setItem("theme", "dark");
//     html.classList.add("dark");
//   }

//   // Apply saved theme on load
//   const saved = localStorage.getItem("theme");
//   if (saved === "light") {
//     html.classList.remove("dark");
//   } else {
//     html.classList.add("dark");
//   }

//   // Update the toggle button's icon/text & classes
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

//   // Run once on load
//   updateThemeButton();

//   // Toggle theme on click
//   toggleBtn.addEventListener("click", () => {
//     html.classList.toggle("dark");
//     const isDark = html.classList.contains("dark");
//     localStorage.setItem("theme", isDark ? "dark" : "light");
//     updateThemeButton();
//   });
// });

// // API Key Logic
// const geminiInput = document.getElementById("gemini-key");
// const openaiInput = document.getElementById("openai-key");
// const saveButton = document.getElementById("save-button");
// const successMsg = document.getElementById("success-message");

// // Load existing keys and hide inputs if already saved
// chrome.storage.sync.get(
//   ["geminiAPIKey", "openaiAPIKey"],
//   ({ geminiAPIKey, openaiAPIKey }) => {
//     if (geminiAPIKey) {
//       document.querySelector('label[for="gemini-key"]').style.display = "none";
//       geminiInput.style.display = "none";
//       geminiInput.nextElementSibling.style.display = "none"; // Hide "Get it from" link
//       const msg = document.createElement("p");
//       msg.className = "text-sm text-green-500";
//       msg.textContent = "✅ Gemini API key already saved!";
//       geminiInput.parentElement.insertBefore(msg, geminiInput);
//     } else {
//       geminiInput.value = "";
//     }

//     if (openaiAPIKey) {
//       document.querySelector('label[for="openai-key"]').style.display = "none";
//       openaiInput.style.display = "none";
//       openaiInput.nextElementSibling.style.display = "none"; // Hide "Get it from" link
//       const msg = document.createElement("p");
//       msg.className = "text-sm text-green-500";
//       msg.textContent = "✅ OpenAI API key already saved!";
//       openaiInput.parentElement.insertBefore(msg, openaiInput);
//     } else {
//       openaiInput.value = "";
//     }
//   }
// );

// saveButton.addEventListener("click", () => {
//   const geminiKey = geminiInput.value.trim();
//   const openaiKey = openaiInput.value.trim();

//   if (!geminiKey && !openaiKey) {
//     alert("Please enter at least one API key.");
//     return;
//   }

//   let keysToSet = {};
//   if (geminiKey) keysToSet.geminiAPIKey = geminiKey;
//   if (openaiKey) keysToSet.openaiAPIKey = openaiKey;

//   chrome.storage.sync.set(keysToSet, () => {
//     if (geminiKey) {
//       document.querySelector('label[for="gemini-key"]').style.display = "none";
//       geminiInput.style.display = "none";
//       geminiInput.nextElementSibling.style.display = "none";
//       const msg = document.createElement("p");
//       msg.className = "text-sm text-green-500";
//       msg.textContent = "✅ Gemini API key saved successfully!";
//       geminiInput.parentElement.insertBefore(msg, geminiInput);
//     }

//     if (openaiKey) {
//       document.querySelector('label[for="openai-key"]').style.display = "none";
//       openaiInput.style.display = "none";
//       openaiInput.nextElementSibling.style.display = "none";
//       const msg = document.createElement("p");
//       msg.className = "text-sm text-green-500";
//       msg.textContent = "✅ OpenAI API key saved successfully!";
//       openaiInput.parentElement.insertBefore(msg, openaiInput);
//     }

//     chrome.storage.sync.get(["geminiAPIKey", "openaiAPIKey"], (res) => {
//       if (res.geminiAPIKey && res.openaiAPIKey) {
//         setTimeout(() => window.close(), 1000); // Only close if both keys are present
//       }
//     });
//   });
// });











// --------------------------------------------------------



// Previous code for options.js



// ---------------------------------------------------------


//   // Load existing keys
//   chrome.storage.sync.get(["geminiAPIKey", "openaiAPIKey"], ({ geminiAPIKey, openaiAPIKey }) => {
//     if (geminiAPIKey) geminiInput.value = geminiAPIKey;
//     if (openaiAPIKey) openaiInput.value = openaiAPIKey;
//   });

//   saveButton.addEventListener("click", () => {
//   const geminiKey = geminiInput.value.trim();
//   const openaiKey = openaiInput.value.trim();

//   if (!geminiKey && !openaiKey) {
//     alert("Please enter at least one API key.");
//     return;
//   }

//   let keysToSet = {};
//   let successText = "";

//   if (geminiKey) {
//     keysToSet.geminiAPIKey = geminiKey;
//     successText += "✅ Gemini API key saved successfully! ";
//   }
//   if (openaiKey) {
//     keysToSet.openaiAPIKey = openaiKey;
//     successText += "✅ OpenAI API key saved successfully!";
//   }

//   chrome.storage.sync.set(keysToSet, () => {
//     successMsg.textContent = successText;
//     successMsg.classList.remove("hidden");

//     // if (geminiKey) geminiInput.value = "";
//     // if (openaiKey) openaiInput.value = "";

//     setTimeout(() => {
//       successMsg.classList.add("hidden");
//       chrome.storage.sync.get(["geminiAPIKey", "openaiAPIKey"], (res) => {
//         if (res.geminiAPIKey && res.openaiAPIKey) {
//           window.close(); // Close only if both keys are set
//         }
//       });
//     }, 1000); // success message shown for 1 second
//   });
// });

//   saveButton.addEventListener("click", () => {
//     const geminiKey = geminiInput.value.trim();
//     const openaiKey = openaiInput.value.trim();

//     if (!geminiKey && !openaiKey) {
//       alert("Please enter at least one API key.");
//       return;
//     }

//     let keysToSet = {};
//     let successText = "";

//     if (geminiKey) {
//       keysToSet.geminiAPIKey = geminiKey;
//       successText += "✅ Gemini API key saved successfully! ";
//     }
//     if (openaiKey) {
//       keysToSet.openaiAPIKey = openaiKey;
//       successText += "✅ OpenAI API key saved successfully!";
//     }

//     chrome.storage.sync.set(keysToSet, () => {
//       successMsg.textContent = successText;
//       successMsg.classList.remove("hidden");

//       if (geminiKey) geminiInput.value = "";
//       if (openaiKey) openaiInput.value = "";

//       // Close window if both keys are now present
//       chrome.storage.sync.get(["geminiAPIKey", "openaiAPIKey"], (res) => {
//         if (res.geminiAPIKey && res.openaiAPIKey) {
//           setTimeout(() => window.close(), 1000);
//         }
//       });
//     });
//   });

// document.addEventListener("DOMContentLoaded", () => {
//     chrome.storage.sync.get(["geminiAPIKey"], ({ geminiAPIKey }) => {
//         if(geminiAPIKey) {
//             document.getElementById("api-key").value = geminiAPIKey;
//         }
//     });

//     document.getElementById("save-button").addEventListener("click", () => {
//         const apiKey = document.getElementById("api-key").value.trim();
//         if(!apiKey) {
//             alert("Please enter a valid API key.");
//             return;
//         }
//         chrome.storage.sync.set({ geminiAPIKey: apiKey }, () => {
//             document.getElementById("success-message").style.display = "block";
//             setTimeout(()=> window.close(), 1000);
//             document.getElementById("success-message").textContent = "API key saved successfully!";
//             document.getElementById("api-key").value = ""; // Clear the input field
//         });
//     });
// });
