function copyElement() {
    if (!selectedElementId) return;

    // Find the current object
    const original = currentDesign.elements.find(e => e.id === selectedElementId);
    
    if (original) {
        // Create a "Deep Copy" so we don't modify the original reference later
        clipboard = JSON.parse(JSON.stringify(original));
        console.log("Copied to clipboard:", clipboard);
        
        // Optional visual feedback
        const btn = document.querySelector('button[title="Ctrl+C"]');
        if(btn) {
            const oldText = btn.innerText;
            btn.innerText = "Copied!";
            setTimeout(() => btn.innerText = oldText, 1000);
        }
    }
}

function pasteElement() {
    if (!clipboard) return; // Nothing to paste

    // 1. Clone the clipboard data again (so we can paste multiple times)
    const newEl = JSON.parse(JSON.stringify(clipboard));

    // 2. Assign unique ID
    newEl.id = 'el-' + Date.now();

    // 3. Offset position so it doesn't stack perfectly on top (visual clue)
    newEl.x += 20;
    newEl.y += 20;

    // 4. Update Z-index to be on top
    newEl.zIndex = currentDesign.elements.length + 1;

    // 5. Add to design
    currentDesign.elements.push(newEl);

    // 6. Select the new element
    selectedElementId = newEl.id;

    // 7. Render updates
    renderCanvas();
    renderLayers();
    renderPropertiesPanel();
    switchTab('props'); // Switch to props so user can edit new item immediately
    addToHistory();
}