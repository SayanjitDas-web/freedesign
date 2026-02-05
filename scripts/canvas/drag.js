let activeDragId = null;
let startX = 0;
let startY = 0;
let initialLeft = 0;
let initialTop = 0;
let dragStartPositions = {}; // Stores initial positions for ALL selected items

function startDrag(e, elementId) {
    e.preventDefault();
    e.stopPropagation(); // Stop event bubbling

    const clickedEl = currentDesign.elements.find(el => el.id === elementId);
    if (!clickedEl || clickedEl.locked) return;

    // --- SELECTION LOGIC ---
    
    // 1. Handle Shift Key (Multi-Select)
    if (e.shiftKey) {
        if (selectedIds.includes(elementId)) {
            // Deselect if already selected
            selectedIds = selectedIds.filter(id => id !== elementId);
        } else {
            selectedIds.push(elementId);
        }
    } 
    // 2. Handle Group Selection (Clicking one selects the whole group)
    else if (clickedEl.groupId) {
        // Find all peers in this group
        const groupMembers = currentDesign.elements.filter(el => el.groupId === clickedEl.groupId);
        selectedIds = groupMembers.map(el => el.id);
    }
    // 3. Standard Single Select (if not already part of the multi-selection)
    else {
        // If we click an item that is ALREADY in the selection, don't clear the others.
        // This allows us to drag a cluster we just made.
        if (!selectedIds.includes(elementId)) {
            selectedIds = [elementId];
        }
    }

    // --- DRAG SETUP ---
    activeDragId = elementId; // This is just the "Handle" for the event
    
    // Capture Start Positions for ALL selected items
    dragStartPositions = {};
    startX = e.clientX;
    startY = e.clientY;

    selectedIds.forEach(id => {
        const el = currentDesign.elements.find(e => e.id === id);
        if (el) {
            // Store original x/y (or x1/y1 for lines)
            dragStartPositions[id] = { 
                x: el.x || 0, y: el.y || 0,
                x1: el.x1 || 0, y1: el.y1 || 0,
                x2: el.x2 || 0, y2: el.y2 || 0,
                cx: el.cx || 0, cy: el.cy || 0
            };
        }
    });

    renderCanvas();
    renderPropertiesPanel(); // Shows properties of the LAST clicked item usually
    renderLayers();
    
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
}

function dragMove(e) {
    if (!activeDragId || selectedIds.length === 0) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Move EVERY selected item
    selectedIds.forEach(id => {
        const el = currentDesign.elements.find(e => e.id === id);
        const startPos = dragStartPositions[id];

        if (el && startPos) {
            if (el.type === 'line') {
                el.x1 = startPos.x1 + dx; el.y1 = startPos.y1 + dy;
                el.x2 = startPos.x2 + dx; el.y2 = startPos.y2 + dy;
                el.cx = startPos.cx + dx; el.cy = startPos.cy + dy;
            } else {
                el.x = startPos.x + dx;
                el.y = startPos.y + dy;
            }
        }
    });

    renderCanvas();
}

function dragEnd(e) {
  if (!activeDragId) return;

  // 1. Save the final position to the data model
  const elDom = document.getElementById(activeDragId);
  const elData = currentDesign.elements.find((el) => el.id === activeDragId);

  if (elData && elDom) {
    elData.x = parseInt(elDom.style.left);
    elData.y = parseInt(elDom.style.top);
  }

  addToHistory();

  // 2. Cleanup
  activeDragId = null;
  document.removeEventListener("mousemove", dragMove);
  document.removeEventListener("mouseup", dragEnd);
}
