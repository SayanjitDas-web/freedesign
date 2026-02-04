function renderCanvas() {
    canvas.innerHTML = '';
    
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
            const div = document.createElement("div");
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
            if (el.type === "rect" || el.type === "circle") {
                div.style.width = el.w + "px";
                div.style.height = el.h + "px";
                div.style.backgroundColor = el.fill;

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
