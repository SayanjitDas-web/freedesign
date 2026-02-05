document.addEventListener('keydown', (e) => {

    // Note: We want Undo to work even inside inputs sometimes, but for now keep it simple.
    if ((e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') && !e.ctrlKey || e.target.isContentEditable) return;

    // Undo (Ctrl+Z)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
    }

    // Redo (Ctrl+Y OR Ctrl+Shift+Z)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
    }

    // 2. COPY (Ctrl+C or Cmd+C)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault(); // Prevent browser default
        copyElement();
    }

    // 3. PASTE (Ctrl+V or Cmd+V)
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteElement();
    }

    // 4. DELETE (Delete or Backspace)
    if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
            deleteElement(selectedElementId);
        }
    }
});
