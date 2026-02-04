function addElement(type) {
    if (!currentDesign) return;

    // 1. Create the Base Object (Properties common to ALL types)
    const newEl = {
        id: "el-" + Date.now(),
        type: type,
        visible: true,
        locked: false,
        opacity: 1,
        zIndex: currentDesign.elements.length + 1,
        rotation: 0,
        
        // Common Styling Defaults
        strokeColor: "#000000",
        strokeWidth: type === 'line' ? 4 : 0, // Lines need width by default, shapes don't
    };

    // 2. Add SHAPE & TEXT Specific Properties
    if (type === 'rect' || type === 'circle' || type === 'text') {
        // Position & Size
        newEl.x = 50; 
        newEl.y = 50; 
        newEl.w = 100; 
        newEl.h = 100;

        // Fill Colors
        newEl.fill = type === "text" ? "transparent" : "#ff6b6b";
        if (type === "circle") {
            newEl.fill = "#4ecdc4";
            newEl.radius = 50; // Visual circle default
        } else {
            newEl.radius = 0;
        }

        // Roundness (Advanced)
        newEl.radiusIsIndividual = false;
        newEl.radiusTL = 0; newEl.radiusTR = 0; 
        newEl.radiusBR = 0; newEl.radiusBL = 0;

        // Shadow Defaults
        newEl.hasShadow = false;
        newEl.shadowX = 5; newEl.shadowY = 5; 
        newEl.shadowBlur = 10; newEl.shadowColor = "rgba(0,0,0,0.3)";

        // Text Specific Defaults
        newEl.content = type === "text" ? "New Text" : "";
        newEl.color = "#333333";
        newEl.fontSize = type === "text" ? 40 : 0;
        newEl.fontFamily = "Roboto";
        newEl.fontWeight = "normal"; 
        newEl.fontStyle = "normal";
        newEl.textAlign = "left";
        newEl.letterSpacing = 0;
        newEl.lineHeight = 1.2;
    }

    // 3. Add LINE Specific Properties (The Missing Piece)
    else if (type === 'line') {
        newEl.x1 = 50;  newEl.y1 = 50;  // Start Point
        newEl.x2 = 250; newEl.y2 = 50;  // End Point
        newEl.cx = 150; newEl.cy = 150; // Control Point (The curve handle)
        
        newEl.strokeType = 'solid';     // solid, dashed, dotted
        newEl.lineCap = 'round';        // round, butt, square
    }

    // 4. Save and Render
    currentDesign.elements.push(newEl);
    selectedElementId = newEl.id;
    
    renderCanvas();
    renderPropertiesPanel();
    
    // Auto-switch to properties tab so user can edit immediately
    if (typeof switchTab === "function") { 
        switchTab('props'); 
    }
}
