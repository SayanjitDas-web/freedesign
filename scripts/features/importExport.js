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
