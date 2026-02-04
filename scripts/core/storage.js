function saveToLocal() {
  localStorage.setItem("myDesigns", JSON.stringify(designs));
}

function saveDesign() {
  if (!currentDesign) return;
  currentDesign.lastSaved = Date.now();
  saveToLocal();
  alert("Design Saved locally!");
}
