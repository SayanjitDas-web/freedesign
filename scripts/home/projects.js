function renderProjectList() {
  projectList.innerHTML = "";

  if (designs.length === 0) {
    projectList.innerHTML =
      '<p class="empty-state">No designs yet. Create one!</p>';
    return;
  }

  designs.forEach((design) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${design.name}</h3>
      <p>${design.elements.length} elements</p>
      <p>Last edited: ${new Date(design.lastSaved).toLocaleDateString()}</p>
      <button class="delete-btn"
        onclick="deleteDesign(event, '${design.id}')">Delete</button>
    `;

    card.onclick = (e) => {
      if (!e.target.classList.contains("delete-btn")) {
        openDesign(design.id);
      }
    };

    projectList.appendChild(card);
  });
}

function createNewDesign() {
    // 1. Ask for Dimensions
    let w = prompt("Enter Canvas Width (px):", "800");
    if (w === null) return; // User clicked Cancel
    
    let h = prompt("Enter Canvas Height (px):", "600");
    if (h === null) return;

    // Validate inputs
    w = parseInt(w) || 800;
    h = parseInt(h) || 600;

    const newId = Date.now().toString();
    const newDesign = {
        id: newId,
        name: "Untitled Design",
        width: w,    // <--- SAVE WIDTH
        height: h,   // <--- SAVE HEIGHT
        backgroundColor: '#ffffff', // Default white
        lastSaved: Date.now(),
        elements: []
    };
    
    designs.push(newDesign);
    saveToLocal();
    openDesign(newId);
}

function deleteDesign(e, id) {
  e.stopPropagation();
  if (!confirm("Are you sure?")) return;

  designs = designs.filter((d) => d.id !== id);
  saveToLocal();
  renderProjectList();
}

function openDesign(id) {
    currentDesign = designs.find(d => d.id === id);
    if (!currentDesign) return;

    // Switch Views
    homeScreen.classList.add('hidden');
    editorScreen.classList.remove('hidden');
    
    // --- NEW: APPLY CANVAS DIMENSIONS ---
    // Use saved values or fallback to 800x600 for old designs
    canvas.style.width = (currentDesign.width || 800) + 'px';
    canvas.style.height = (currentDesign.height || 600) + 'px';
    canvas.style.backgroundColor = currentDesign.backgroundColor || '#ffffff';

    // Load Data
    titleInput.innerText = currentDesign.name;
    
    // Reset Selection & History
    selectedIds = [];
    historyStack = [];
    historyStep = -1;
    
    renderCanvas(); // Render elements
    renderPropertiesPanel(); // Show canvas props (since nothing selected)
    addToHistory(); // Save initial state
}

function goHome() {
  saveDesign();
  editorScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
  currentDesign = null;
  renderProjectList();
}

function updateTitle() {
  if (currentDesign) currentDesign.name = titleInput.innerText;
}
