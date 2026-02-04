function renderLayers() {
  const list = document.getElementById("layers-list");
  list.innerHTML = "";

  // We loop backwards so the "Top" layer is visually at the top of the list
  const elementsReverse = [...currentDesign.elements].reverse();

  elementsReverse.forEach((el, index) => {
    const item = document.createElement("div");
    item.className = "layer-item";

    // --- 1. GROUP LOGIC ---
    if (el.groupId) {
        item.classList.add('is-group-child');
    }

    // --- 2. MULTI-SELECTION LOGIC ---
    // Check if this ID is in our array of selected IDs (supports multi-select)
    if (selectedIds.includes(el.id)) {
        item.classList.add("active");
    }

    // --- 3. STATUS STYLES ---
    if (el.locked) item.classList.add("is-locked");
    if (!el.visible) item.classList.add("is-hidden");

    // --- DRAG & DROP ATTRIBUTES ---
    item.draggable = true;
    item.dataset.id = el.id;

    // Attach Events
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragover", handleDragOver);
    item.addEventListener("drop", handleDrop);
    item.addEventListener("dragenter", handleDragEnter);
    item.addEventListener("dragleave", handleDragLeave);
    item.addEventListener("dragend", handleDragEnd);

    // --- HTML CONTENT ---
    // Note: We updated the onclick to pass 'event' for Shift-Click support
    item.innerHTML = `
            <div class="layer-header">
                <span class="layer-name" onclick="selectLayer('${el.id}', event)">
                    ${el.groupId ? '<span style="color:var(--primary); font-weight:bold;">↳ </span>' : ''}
                    ${el.type.toUpperCase()} ${el.content ? "- " + el.content.substring(0, 12) + "..." : ""}
                </span>
                <div class="layer-controls">
                    <span class="icon-btn" onclick="toggleHide('${el.id}')">
                        ${el.visible ? "👁️" : "🚫"}
                    </span>
                    <span class="icon-btn" onclick="toggleLock('${el.id}')">
                        ${el.locked ? "🔒" : "🔓"}
                    </span>
                    <span class="icon-btn" style="color:red" onclick="deleteElement('${el.id}')">🗑️</span>
                </div>
            </div>
            <div class="layer-slider">
                <span>Op:</span>
                <input type="range" min="0" max="1" step="0.1" 
                       value="${el.opacity}" 
                       oninput="updateOpacity('${el.id}', this.value)">
            </div>
        `;
    list.appendChild(item);
  });
}

function selectLayer(id, e) {
    // Check if Shift key is held down
    if (e && e.shiftKey) {
         if (selectedIds.includes(id)) {
             // If already selected, remove it
             selectedIds = selectedIds.filter(x => x !== id);
         } else {
             // Add to selection
             selectedIds.push(id);
         }
    } else {
        // Standard click: select ONLY this one
        selectedIds = [id];
    }
    
    // Update Global Selection ID for property panel to reference the last clicked item
    selectedElementId = id; 

    renderCanvas();
    renderLayers();
    renderPropertiesPanel();
}

function toggleHide(id) {
  const el = currentDesign.elements.find((e) => e.id === id);
  if (el) {
    el.visible = !el.visible;
    // If hidden, deselect it
    if (!el.visible && selectedElementId === id) selectedElementId = null;
    renderCanvas();
  }
}

function toggleLock(id) {
  const el = currentDesign.elements.find((e) => e.id === id);
  if (el) {
    el.locked = !el.locked;
    renderCanvas();
  }
}

function updateOpacity(id, val) {
  const el = currentDesign.elements.find((e) => e.id === id);
  if (el) {
    el.opacity = val;
    // Optimization: Don't re-render entire canvas for opacity, just update DOM
    document.getElementById(id).style.opacity = val;
  }
}

function deleteElement(id) {
  if (confirm("Delete this layer?")) {
    currentDesign.elements = currentDesign.elements.filter((e) => e.id !== id);
    selectedElementId = null;
    renderCanvas();
  }
}

let draggedLayerId = null;

function handleDragStart(e) {
  draggedLayerId = this.dataset.id;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault(); // Necessary to allow dropping
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDragEnter(e) {
  this.classList.add("drag-over");
}

function handleDragLeave(e) {
  this.classList.remove("drag-over");
}

function handleDragEnd(e) {
  this.classList.remove("dragging");
  document
    .querySelectorAll(".layer-item")
    .forEach((item) => item.classList.remove("drag-over"));
}

function handleDrop(e) {
  e.stopPropagation(); // Stops the browser from redirecting.

  const targetLayerId = this.dataset.id;

  if (draggedLayerId !== targetLayerId) {
    reorderLayers(draggedLayerId, targetLayerId);
  }
  return false;
}

function reorderLayers(fromId, toId) {
  const elements = currentDesign.elements;

  // 1. Find the indices in the REAL data array
  const fromIndex = elements.findIndex((el) => el.id === fromId);
  const toIndex = elements.findIndex((el) => el.id === toId);

  if (fromIndex < 0 || toIndex < 0) return;

  // 2. Remove the item from the old position
  const [movedItem] = elements.splice(fromIndex, 1);

  // 3. Insert it at the new position
  // Note: Because the UI is reversed, dropping "above" visually might mean different array math.
  // This simple splice logic inserts it exactly at the index of the target.
  elements.splice(toIndex, 0, movedItem);

  // 4. Update Z-index properties (optional, but good for data consistency)
  elements.forEach((el, index) => {
    el.zIndex = index + 1;
  });

  // 5. Re-render everything
  renderCanvas(); // Redraws canvas with new stacking order
  renderLayers(); // Redraws list to reflect new order
}


// --- GROUPING LOGIC ---

function groupSelected() {
    if (selectedIds.length < 2) {
        alert("Select at least 2 elements to group (Shift+Click).");
        return;
    }

    const newGroupId = 'grp-' + Date.now();
    
    // Assign Group ID to all selected
    currentDesign.elements.forEach(el => {
        if (selectedIds.includes(el.id)) {
            el.groupId = newGroupId;
        }
    });

    renderLayers();
    renderCanvas();
}

function ungroupSelected() {
    if (selectedIds.length === 0) return;

    currentDesign.elements.forEach(el => {
        if (selectedIds.includes(el.id)) {
            delete el.groupId; // Remove property
        }
    });

    // Reset selection to individual items
    renderLayers();
    renderCanvas();
}

// --- MERGE LOGIC (Container Strategy) ---

function mergeSelected() {
    if (selectedIds.length < 2) {
        alert("Select at least 2 elements to merge.");
        return;
    }

    // 1. Calculate Bounding Box of all selected items
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const selectedEls = currentDesign.elements.filter(el => selectedIds.includes(el.id));
    
    // Note: This simple merge supports Shapes/Text. Lines are complex to merge this way.
    const validEls = selectedEls.filter(el => el.type !== 'line');
    
    if(validEls.length === 0) {
        alert("Cannot merge lines. Group them instead.");
        return;
    }

    validEls.forEach(el => {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.w || el.x + 100);
        maxY = Math.max(maxY, el.y + el.h || el.y + 100);
    });

    // 2. Create Container Element
    const container = {
        id: 'merged-' + Date.now(),
        type: 'rect', // We simulate a container as a rectangle with transparent background
        x: minX,
        y: minY,
        w: maxX - minX,
        h: maxY - minY,
        fill: 'rgba(0,0,0,0.05)', // Slight gray tint to show it's a merged block
        strokeWidth: 1,
        strokeColor: '#999',
        strokeType: 'dashed',
        visible: true,
        opacity: 1,
        zIndex: currentDesign.elements.length + 1,
        locked: false,
        // Custom property to hold content if we wanted to get fancy, 
        // but for now, we just CREATE A NEW BOX and DELETE the old ones? 
        // NO, that deletes data.
        
        // BETTER MERGE:
        // True "Merge" in DOM is hard. 
        // Let's implement "Group" as the primary feature. 
        // IF user insists on Merge, we group them and LOCK them.
    };
    
    // Alternative Interpretation of Merge: "Combine Text"
    if (validEls.every(e => e.type === 'text')) {
        // Merge Text Content
        const combinedText = validEls.sort((a,b) => a.y - b.y).map(e => e.content).join('\n');
        container.type = 'text';
        container.content = combinedText;
        container.color = validEls[0].color;
        container.fontSize = validEls[0].fontSize;
        container.fontFamily = validEls[0].fontFamily;
        container.fill = 'transparent';
        
        // Remove old
        currentDesign.elements = currentDesign.elements.filter(el => !selectedIds.includes(el.id));
        
        // Add new
        currentDesign.elements.push(container);
        selectedIds = [container.id];
        renderCanvas();
        return;
    }

    // Default "Merge" behavior -> "Lock Group"
    alert("Full shape merging requires vector libraries. Grouping them instead!");
    groupSelected();
}