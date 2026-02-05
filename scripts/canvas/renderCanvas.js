function renderCanvas() {

    canvas.innerHTML = '';
    
    // Re-create overlay structure dynamically (Safer than saving reference)
    const overlayHTML = `
        <div id="transform-overlay" class="transform-controls">
            <div class="resize-handle handle-tl" data-handle="tl"></div>
            <div class="resize-handle handle-tr" data-handle="tr"></div>
            <div class="resize-handle handle-bl" data-handle="bl"></div>
            <div class="resize-handle handle-br" data-handle="br"></div>
            <div class="resize-handle handle-tm" data-handle="tm"></div>
            <div class="resize-handle handle-bm" data-handle="bm"></div>
            <div class="resize-handle handle-lm" data-handle="lm"></div>
            <div class="resize-handle handle-rm" data-handle="rm"></div>
            <div class="rot-stick"></div>
            <div class="resize-handle handle-rot" data-handle="rot"></div>
        </div>
    `;
    canvas.innerHTML = overlayHTML;
    
    // Re-attach listeners to the new DOM elements
    document.querySelectorAll('.resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            startResize(e, e.target.dataset.handle);
        });
    });
    
    // Remove any leftover handles from the DOM to ensure a clean slate
    document.querySelectorAll('.handle').forEach(h => h.remove());

    currentDesign.elements.forEach(el => {
        let node;

        // ==========================================
        // 1. RENDER LINES (SVG based)
        // ==========================================
        if (el.type === 'line') {
            node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            node.setAttribute('class', `element line ${selectedElementId === el.id ? 'selected' : ''}`);
            node.setAttribute('id', el.id);
            
            // SVG covers the whole canvas to allow points anywhere
            node.style.position = 'absolute';
            node.style.left = '0'; 
            node.style.top = '0';
            node.style.width = '100%'; 
            node.style.height = '100%';
            node.style.zIndex = el.zIndex;
            node.style.display = el.visible ? 'block' : 'none';

            if(el.locked) node.style.pointerEvents = 'none';

            // Define Dash Array
            let dash = '0';
            if (el.strokeType === 'dashed') dash = '10, 5';
            if (el.strokeType === 'dotted') dash = '2, 5';

            // Draw Path (Quadratic Bezier: M = Move to, Q = Curve to)
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', `M ${el.x1} ${el.y1} Q ${el.cx} ${el.cy} ${el.x2} ${el.y2}`);
            path.setAttribute('stroke', el.strokeColor);
            path.setAttribute('stroke-width', el.strokeWidth);
            path.setAttribute('stroke-dasharray', dash);
            path.setAttribute('stroke-linecap', el.lineCap);
            path.setAttribute('fill', 'none'); // Important: Lines don't have fill
            
            node.appendChild(path);

            // Drag event for the line itself
            node.onmousedown = (e) => startDrag(e, el.id);

            // IF SELECTED: Render Control Handles
            if (selectedElementId === el.id && !el.locked) {
                renderHandle(el.id, 'start', el.x1, el.y1);
                renderHandle(el.id, 'control', el.cx, el.cy); // Curve handle
                renderHandle(el.id, 'end', el.x2, el.y2);
                
                // Draw thin guide lines for the curve visual (from start -> control -> end)
                const guide = document.createElementNS("http://www.w3.org/2000/svg", "path");
                guide.setAttribute('d', `M ${el.x1} ${el.y1} L ${el.cx} ${el.cy} L ${el.x2} ${el.y2}`);
                guide.setAttribute('stroke', '#ccc');
                guide.setAttribute('stroke-width', '1');
                guide.setAttribute('stroke-dasharray', '4, 4');
                guide.setAttribute('fill', 'none');
                guide.style.pointerEvents = 'none';
                node.insertBefore(guide, path); // Put visual guide behind the main line
            }
            
            canvas.appendChild(node);
        } 

        // ==========================================
        // 2. RENDER SHAPES & TEXT (DIV based)
        // ==========================================
        else {
            let div;
            
            // A. Create Element based on type
            if (el.type === 'image') {
                div = document.createElement("img");
                div.src = el.src;
                div.draggable = false; // Prevent native browser drag ghosting
                div.style.objectFit = "cover"; // Ensure image fills box
            } else {
                div = document.createElement("div");
            }
            div.className = `element ${el.type}`;
            div.id = el.id;

            // Basic Positioning & Visibility
            div.style.left = el.x + "px";
            div.style.top = el.y + "px";
            div.style.opacity = el.opacity;
            div.style.display = el.visible ? "flex" : "none";
            div.style.zIndex = el.zIndex;
            div.style.transform = `rotate(${el.rotation}deg)`; 
            div.style.transformOrigin = 'center center'; // Spin around the middle
            
            if (el.locked) div.style.cursor = "not-allowed";

            // --- Shadow Logic ---
            if (el.hasShadow) {
                const shadowStr = `${el.shadowX}px ${el.shadowY}px ${el.shadowBlur}px ${el.shadowColor}`;
                if (el.type === "text") {
                    div.style.textShadow = shadowStr;
                    div.style.boxShadow = "none";
                } else {
                    div.style.boxShadow = shadowStr;
                    div.style.textShadow = "none";
                }
            } else {
                div.style.boxShadow = "none";
                div.style.textShadow = "none";
            }

            // --- Stroke/Border Logic ---
            if (el.type === "text") {
                div.style.webkitTextStroke = `${el.strokeWidth}px ${el.strokeColor}`;
            } else {
                div.style.border = `${el.strokeWidth}px solid ${el.strokeColor}`;
            }

            // --- SHAPE Specific Styling ---
            if (el.type === "rect" || el.type === "circle" || el.type === "image") {
                div.style.width = el.w + "px";
                div.style.height = el.h + "px";
                if (el.type !== 'image') div.style.backgroundColor = el.fill;

                // Roundness Logic
                if (el.radiusIsIndividual) {
                    div.style.borderRadius = `${el.radiusTL}% ${el.radiusTR}% ${el.radiusBR}% ${el.radiusBL}%`;
                } else {
                    div.style.borderRadius = `${el.radius}%`;
                }
            } 
            
            // --- TEXT Specific Styling ---
            else if (el.type === "text") {
                div.innerText = el.content;
                div.style.color = el.color;
                div.style.fontSize = el.fontSize + "px";
                div.style.fontFamily = el.fontFamily;
                
                // Advanced Text Styling
                div.style.fontWeight = el.fontWeight;
                div.style.fontStyle = el.fontStyle;
                div.style.textAlign = el.textAlign;
                div.style.letterSpacing = el.letterSpacing + "px";
                div.style.lineHeight = el.lineHeight;

                div.style.whiteSpace = "pre-wrap"; // Allow wrapping
                div.style.minWidth = "50px";       // Click target
            }

            // Interaction
            div.onmousedown = (e) => startDrag(e, el.id);

            // Selection Highlight
            if (selectedElementId === el.id) div.classList.add("selected");

            canvas.appendChild(div);
        }
    });

    // Re-render the layers panel to reflect any changes (like re-ordering)
    renderLayers();
    updateTransformOverlay()
}

function renderHandle(parentId, type, x, y) {
    const handle = document.createElement('div');
    handle.className = `handle ${type === 'control' ? 'control-point' : ''}`;
    handle.style.left = x + 'px';
    handle.style.top = y + 'px';
    
    handle.onmousedown = (e) => {
        e.stopPropagation(); 
        startDragHandle(e, parentId, type);
    };
    
    canvas.appendChild(handle);
}

function updateTransformOverlay() {
    const overlay = document.getElementById('transform-overlay');
    
    // 1. Hide if nothing selected OR selection is a Line OR multi-selection
    if (!selectedIds || selectedIds.length !== 1) {
        overlay.classList.remove('active');
        return;
    }
    
    const id = selectedIds[0];
    const el = currentDesign.elements.find(e => e.id === id);

    // Hide for Lines
    if (!el || el.type === 'line' || el.locked) {
        overlay.classList.remove('active');
        return;
    }

    // 2. Position Overlay
    // Note: The overlay sits inside .workspace, but we position it absolutely relative to the canvas
    // We need to account for the canvas element offset.
    const canvasRect = canvas.getBoundingClientRect(); // 0,0 relative to viewport
    const workspaceRect = document.querySelector('.workspace').getBoundingClientRect();
    
    // Simple approach: Put overlay INSIDE #canvas in HTML? 
    // Actually, sticking it inside #canvas is easier for coordinates. 
    // Let's assume you moved the HTML: <div id="canvas"> ... <div id="transform-overlay"></div> </div>
    // If kept outside, we just match 'left' and 'top' style.
    
    overlay.classList.add('active');
    overlay.style.width = el.w + 'px';
    overlay.style.height = el.h + 'px';
    
    // We apply the exact same transform as the element
    overlay.style.transform = `translate(${el.x}px, ${el.y}px) rotate(${el.rotation || 0}deg)`;
    overlay.style.transformOrigin = 'center center';
    
    // IMPORTANT: Reset left/top because we use translate now for cleaner rotation support
    overlay.style.left = '0px';
    overlay.style.top = '0px';
}

// --- RESIZE & ROTATE LOGIC ---

// 1. Initialize listeners on handles
document.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // Don't drag the object itself
        e.preventDefault();
        
        const handleType = e.target.dataset.handle;
        startResize(e, handleType);
    });
});

function startResize(e, handleType) {
    if (selectedIds.length !== 1) return;
    
    const el = currentDesign.elements.find(e => e.id === selectedIds[0]);
    if (!el) return;

    isResizing = true;
    currentHandle = handleType;

    // Capture initial state
    resizeStart = {
        x: e.clientX,
        y: e.clientY,
        w: el.w,
        h: el.h,
        elX: el.x,
        elY: el.y,
        rotation: el.rotation || 0
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
}

function handleResizeMove(e) {
    if (!isResizing) return;
    
    const el = currentDesign.elements.find(e => e.id === selectedIds[0]);
    if (!el) return;

    // Calculate Delta
    let dx = e.clientX - resizeStart.x;
    let dy = e.clientY - resizeStart.y;

    // ROTATION LOGIC
    if (currentHandle === 'rot') {
        // Calculate angle between center of element and mouse
        // 1. Get center of element in screen coordinates
        const canvasRect = canvas.getBoundingClientRect();
        const centerX = canvasRect.left + el.x + (el.w / 2);
        const centerY = canvasRect.top + el.y + (el.h / 2);
        
        // 2. Math.atan2(y, x)
        const radians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const degrees = radians * (180 / Math.PI);
        
        // Offset by 90 deg because 0 is usually 3 o'clock
        el.rotation = Math.round(degrees + 90);
        
        renderCanvas();
        return;
    }

    // RESIZE LOGIC
    // Note: Rotated resize is complex math. 
    // For this MVP, we assume resizing happens on unrotated axes or user accepts slight skew logic.
    // Ideally, we project dx/dy onto the rotation vector.
    
    // Simplification for MVP: Ignore rotation for resize math (Standard behavior in simple editors)
    
    if (currentHandle.includes('r')) { // Right
        el.w = Math.max(10, resizeStart.w + dx);
    }
    if (currentHandle.includes('b')) { // Bottom
        el.h = Math.max(10, resizeStart.h + dy);
    }
    if (currentHandle.includes('l')) { // Left
        const newW = Math.max(10, resizeStart.w - dx);
        el.w = newW;
        el.x = resizeStart.elX + (resizeStart.w - newW);
    }
    if (currentHandle.includes('t')) { // Top
        const newH = Math.max(10, resizeStart.h - dy);
        el.h = newH;
        el.y = resizeStart.elY + (resizeStart.h - newH);
    }
    
    // Update visuals
    renderCanvas();
    renderPropertiesPanel(); // Update W/H inputs live
}

function handleResizeEnd() {
    isResizing = false;
    currentHandle = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    
    addToHistory(); // Save state
}