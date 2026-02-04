function loadSavedFonts() {
  availableFonts.forEach((fontName) => {
    // We don't need to load standard web safe fonts or defaults if they are already linked in CSS
    // But for simplicity, we check if it's NOT a standard default (or just load everything to be safe)
    if (!defaultFonts.includes(fontName)) {
      injectFontLink(fontName);
    }
  });
}

function injectFontLink(fontName) {
  const formattedName = fontName.trim().replace(/\s+/g, "+");
  const url = `https://fonts.googleapis.com/css2?family=${formattedName}&display=swap`;

  // Check if already exists to prevent duplicates
  if (document.querySelector(`link[href="${url}"]`)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

function triggerAddFont() {
  const fontName = prompt(
    "Enter the exact name of the Google Font (e.g., 'Anton', 'Bangers'):",
  );

  if (!fontName) return;

  // Check if we already have it
  if (availableFonts.includes(fontName)) {
    alert("Font is already added!");
    return;
  }

  // 1. Construct URL
  const formattedName = fontName.trim().replace(/\s+/g, "+");
  const url = `https://fonts.googleapis.com/css2?family=${formattedName}&display=swap`;

  // 2. Create the HTML Link element
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;

  // 3. Handle Success
  link.onload = () => {
    // A. Add to state
    availableFonts.push(fontName);

    // B. SAVE TO LOCAL STORAGE
    localStorage.setItem("myFonts", JSON.stringify(availableFonts));

    alert(`Font "${fontName}" loaded and saved!`);

    // C. Refresh UI if panel is open
    if (selectedElementId) renderPropertiesPanel();
  };

  // 4. Handle Error
  link.onerror = () => {
    alert(`Error: Could not find font "${fontName}". Please check spelling.`);
    link.remove();
  };

  // 5. Append
  document.head.appendChild(link);
}
