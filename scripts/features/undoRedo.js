// --- UNDO / REDO SYSTEM ---

function addToHistory() {
    // 1. If we are in the middle of the stack (undid recently), remove the "future"
    if (historyStep < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyStep + 1);
    }

    // 2. Push deep copy of current state
    // We use JSON parse/stringify for a cheap "Deep Clone"
    const state = JSON.stringify(currentDesign);
    historyStack.push(state);

    // 3. Increment Step
    historyStep++;

    // 4. Limit Memory
    if (historyStack.length > MAX_HISTORY) {
        historyStack.shift(); // Remove oldest
        historyStep--;
    }
}

function undo() {
    if (historyStep > 0) { // Can we go back?
        historyStep--;
        loadHistoryState();
    }
}

function redo() {
    if (historyStep < historyStack.length - 1) { // Can we go forward?
        historyStep++;
        loadHistoryState();
    }
}

function loadHistoryState() {
    // 1. Load data
    const stateStr = historyStack[historyStep];
    currentDesign = JSON.parse(stateStr);

    // 2. Restore Selection (optional, but nice)
    // We need to verify selected IDs still exist in this past state
    const existingIds = currentDesign.elements.map(e => e.id);
    selectedIds = selectedIds.filter(id => existingIds.includes(id));

    // 3. Re-render everything
    renderCanvas();
    renderLayers();
    renderPropertiesPanel();
}

// --- PROPERTY HISTORY LISTENER ---
// This catches the "change" event which bubbles up from inputs
document.getElementById('properties-panel').addEventListener('change', (e) => {
    // If the event came from an input, save state
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        addToHistory();
    }
});