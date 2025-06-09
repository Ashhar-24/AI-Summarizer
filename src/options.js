document.addEventListener("DOMContentLoaded", () => {
  // ---------
  // Theme Toggle
  // ---------
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
    const isDark = html.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeButton();
  });

  // ---------
  // API Key Management
  // ---------
  const geminiBlock = document.getElementById("gemini-block");
  // const openaiBlock = document.getElementById("openai-block");
  const huggingfaceBlock = document.getElementById("huggingface-block");

  const geminiInput = document.getElementById("gemini-key");
  // const openaiInput = document.getElementById("openai-key");
  const huggingfaceInput = document.getElementById("huggingface-key");
  const saveButton = document.getElementById("save-button");

  const geminiSuccessContainer = document.getElementById(
    "gemini-success-container"
  );
  const huggingfaceSuccessContainer = document.getElementById(
    "huggingface-success-container"
  );

  // Helper to create success message + “Change” button for a given provider
  function showSavedUI(provider) {
    const container =
      provider === "gemini"
        ? geminiSuccessContainer
        : huggingfaceSuccessContainer;

    // Clear any existing content
    container.innerHTML = "";

    // Create a wrapper div with flex layout
    const wrapper = document.createElement("div");
    wrapper.className =
      "flex items-center justify-between bg-green-50 dark:bg-green-900 rounded-md p-2";

    // Create success <p>
    const msg = document.createElement("p");
    msg.className = "text-sm text-green-700 dark:text-green-300 flex-1";
    msg.textContent =
      provider === "gemini"
        ? "✅ Gemini API key saved successfully!"
        : "✅ Hugging Face API key saved successfully!";

    // Create “Change” button

    const changeBtn = document.createElement("span");
    changeBtn.setAttribute("role", "button");
    changeBtn.className = `ml-4 cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200`;
    changeBtn.textContent = "Edit";

    // Clears existing API key from storage and restores input UI
    // changeBtn.addEventListener("click", () => {
    //   // Remove key from chrome.storage and restore input UI
    //   const keyName = provider === "gemini" ? "geminiAPIKey" : "huggingfaceAPIKey";
    //   chrome.storage.sync.remove(keyName, () => {
    //     // Remove the success message (wrapper)
    //     container.innerHTML = "";

    //     // Show label, input, and “Get it from…” link again
    //     const block = provider === "gemini" ? geminiBlock : huggingfaceBlock;
    //     const label = block.querySelector(`label[for="${provider}-key"]`);
    //     const input = provider === "gemini" ? geminiInput : huggingfaceInput;
    //     const getLink = input.nextElementSibling; // the <p> link just below input

    //     label.style.display = "block";
    //     input.style.display = "block";
    //     getLink.style.display = "block";
    //   });
    // });

    // On clicking 'Edit', restores the saved API for editing
    changeBtn.addEventListener("click", () => {
      const keyName =
        provider === "gemini" ? "geminiAPIKey" : "huggingfaceAPIKey";
      const block = provider === "gemini" ? geminiBlock : huggingfaceBlock;
      const label = block.querySelector(`label[for="${provider}-key"]`);
      const input = provider === "gemini" ? geminiInput : huggingfaceInput;
      const getLink = input.nextElementSibling;

      // Clear the success message UI
      container.innerHTML = "";

      // Show label, input, and getLink again
      label.style.display = "block";
      input.style.display = "block";
      getLink.style.display = "block";

      // Prefill input with stored key
      chrome.storage.sync.get([keyName], (result) => {
        if (result[keyName]) {
          input.value = result[keyName];
        } else {
          input.value = "";
        }
      });
    });

    // Assemble wrapper
    wrapper.appendChild(msg);
    wrapper.appendChild(changeBtn);

    // Append wrapper to the container div
    container.appendChild(wrapper);

    // Finally hide the original input + label + getLink
    const block = provider === "gemini" ? geminiBlock : huggingfaceBlock;
    const label = block.querySelector(`label[for="${provider}-key"]`);
    const input = provider === "gemini" ? geminiInput : huggingfaceInput;
    const getLink = input.nextElementSibling;

    label.style.display = "none";
    input.style.display = "none";
    getLink.style.display = "none";
  }

  // On load: see if either key is already saved
  chrome.storage.sync.get(
    ["geminiAPIKey", "huggingfaceAPIKey"],
    ({ geminiAPIKey, huggingfaceAPIKey }) => {
      if (geminiAPIKey) {
        showSavedUI("gemini");
      }
      if (huggingfaceAPIKey) {
        showSavedUI("huggingface");
      }
    }
  );

  saveButton.addEventListener("click", () => {
    const geminiKey = geminiInput.value.trim();
    const huggingfaceKey = huggingfaceInput.value.trim();

    if (!geminiKey && !huggingfaceKey) {
      alert("Please enter at least one API key.");
      return;
    }

    // Build object to store whichever keys were provided
    const toSet = {};
    if (geminiKey) toSet.geminiAPIKey = geminiKey;
    if (huggingfaceKey) toSet.huggingfaceAPIKey = huggingfaceKey;

    chrome.storage.sync.set(toSet, () => {
      // Show saved UI only for whichever input was visible
      if (geminiKey && geminiInput.style.display !== "none") {
        showSavedUI("gemini");
      }
      if (huggingfaceKey && huggingfaceInput.style.display !== "none") {
        showSavedUI("huggingface");
      }

      // If both keys now exist, close after 0.7s
      chrome.storage.sync.get(["geminiAPIKey", "huggingfaceAPIKey"], (res) => {
        if (res.geminiAPIKey && res.huggingfaceAPIKey) {
          setTimeout(() => window.close(), 700);
        }
      });
    });
  });
});
