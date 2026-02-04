document.addEventListener('keydown', (e) => {
    // 1. Safety: Don't trigger if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
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