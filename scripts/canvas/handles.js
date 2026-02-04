let activeHandle = null;

function startDragHandle(e, elId, type) {
    e.preventDefault();
    activeHandle = { id: elId, type: type };
    startX = e.clientX;
    startY = e.clientY;
    
    document.addEventListener('mousemove', dragHandleMove);
    document.addEventListener('mouseup', dragHandleEnd);
}

function dragHandleMove(e) {
    if (!activeHandle) return;

    // Calculate Delta
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Find Element
    const el = currentDesign.elements.find(e => e.id === activeHandle.id);
    if (!el) return;

    // Update specific coordinate based on handle type
    if (activeHandle.type === 'start') {
        el.x1 += dx; el.y1 += dy;
    } else if (activeHandle.type === 'end') {
        el.x2 += dx; el.y2 += dy;
    } else if (activeHandle.type === 'control') {
        el.cx += dx; el.cy += dy;
    }

    // Reset Start for next frame
    startX = e.clientX;
    startY = e.clientY;

    renderCanvas(); // Redraw immediately
}

function dragHandleEnd() {
    activeHandle = null;
    document.removeEventListener('mousemove', dragHandleMove);
    document.removeEventListener('mouseup', dragHandleEnd);
}
