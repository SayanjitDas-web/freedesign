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
  const newId = Date.now().toString();
  designs.push({
    id: newId,
    name: "Untitled Design",
    lastSaved: Date.now(),
    elements: [],
  });
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
  currentDesign = designs.find((d) => d.id === id);
  if (!currentDesign) return;

  homeScreen.classList.add("hidden");
  editorScreen.classList.remove("hidden");

  titleInput.innerText = currentDesign.name;
  renderCanvas();
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
