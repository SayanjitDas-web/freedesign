function exportDesign() {
  if (!currentDesign) return;

  const dataStr = JSON.stringify(currentDesign, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentDesign.name.replace(/\s+/g, "_")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import logic triggers
function triggerImport() {
  document.getElementById("file-input").click();
}

function handleFileImport(input) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedDesign = JSON.parse(e.target.result);

      // Basic validation
      if (!importedDesign.elements || !importedDesign.name) {
        throw new Error("Invalid design file");
      }

      // Ensure unique ID to avoid collision
      importedDesign.id = Date.now().toString();

      designs.push(importedDesign);
      saveToLocal();
      renderProjectList();
      alert("Design imported successfully!");
    } catch (err) {
      alert("Error importing file: " + err.message);
    }
  };
  reader.readAsText(file);
  input.value = ""; // Reset input so same file can be selected again
}

// --- IMAGE EXPORT LOGIC ---

function downloadImage(format) {
    const canvasEl = document.getElementById('canvas');
    if (!canvasEl) return;

    // 1. SAVE STATE & DESELECT EVERYTHING
    // We do this so the resize handles/blue outlines don't show up in the image
    const previouslySelected = [...selectedIds];
    selectedIds = [];
    renderCanvas(); // Re-render to clear the overlay/selection visuals

    // 2. WAIT FOR RENDER, THEN CAPTURE
    // We use a tiny timeout to ensure the DOM has updated (hiding handles)
    setTimeout(() => {
        // Options for html2canvas
        const options = {
            useCORS: true, // Allows loading images from other domains (like Unsplash/Google)
            backgroundColor: format === 'png' ? null : '#ffffff', // PNG = Transparent, JPG = White
            scale: 2 // Higher quality (2x resolution)
        };

        html2canvas(canvasEl, options).then(canvas => {
            // 3. CONVERT TO IMAGE FILE
            const link = document.createElement('a');
            
            // Name the file based on the design title
            const filename = (currentDesign.name || 'design').replace(/\s+/g, '_');
            
            if (format === 'png') {
                link.download = `${filename}.png`;
                link.href = canvas.toDataURL('image/png');
            } else {
                link.download = `${filename}.jpg`;
                link.href = canvas.toDataURL('image/jpeg', 0.9); // 0.9 = 90% Quality
            }

            // 4. TRIGGER DOWNLOAD
            link.click();

            // 5. RESTORE SELECTION
            selectedIds = previouslySelected;
            renderCanvas();
            renderPropertiesPanel();
        });
    }, 50);
}