function renderPropertiesPanel() {
    // 1. Get the parent wrapper
    const panel = document.getElementById('properties-panel');
    if (!panel) return;

    // 2. CHECK SELECTION
    if (!selectedIds || selectedIds.length === 0) {
        panel.innerHTML = '<p class="empty-selection">Select an element to edit properties.</p>';
        return;
    }

    // 3. PREPARE THE CONTAINER
    panel.innerHTML = '<div id="prop-controls"></div>';
    const container = document.getElementById('prop-controls');

    // 4. GET ACTIVE ELEMENT (Last one selected)
    const activeId = selectedIds[selectedIds.length - 1];
    const el = currentDesign.elements.find(e => e.id === activeId);

    if (!el) return;

    // --- HELPER FUNCTIONS ---
    const row = (label, input) => `<div class="prop-row"><label>${label}</label>${input}</div>`;
    const section = (title) => `<div style="margin:10px 0 5px 0; font-weight:bold; font-size:11px; text-transform:uppercase; border-bottom:1px solid #ddd;">${title}</div>`;

    let html = '';

    // --- MULTI-SELECT NOTICE ---
    if (selectedIds.length > 1) {
        html += `<div style="padding:5px; background:#e3f2fd; color:#0d47a1; font-size:11px; margin-bottom:10px; border-radius:4px;">
            Editing: <b>${el.type}</b> (+${selectedIds.length - 1} others)
        </div>`;
    }

    // ==========================================
    // 1. BASIC DIMENSIONS (Shapes)
    // ==========================================
    if (el.type !== 'text' && el.type !== 'line') {
        html += section("Dimensions & Color");
        html += row('Fill', `<input type="color" value="${el.fill}" oninput="updateProp('${el.id}', 'fill', this.value)">`);
        
        // Rotation
        html += row('Rotation', `
            <div style="display:flex; align-items:center; gap:5px;">
                <input type="range" min="0" max="360" value="${el.rotation || 0}" oninput="updateProp('${el.id}', 'rotation', this.value)" style="flex:1">
                <span style="font-size:10px; width:30px;">${el.rotation || 0}°</span>
            </div>
        `);
        
        html += row('Width', `<input type="number" value="${el.w}" oninput="updateProp('${el.id}', 'w', this.value)">`);
        html += row('Height', `<input type="number" value="${el.h}" oninput="updateProp('${el.id}', 'h', this.value)">`);
    }

    // ==========================================
    // 2. TEXT PROPERTIES
    // ==========================================
    if (el.type === 'text') {
        html += section("Typography");
        html += row('Text', `<textarea rows="3" oninput="updateProp('${el.id}', 'content', this.value)">${el.content}</textarea>`);
        
        // Font Family
        let fontOptions = availableFonts.map(f => 
            `<option value="${f}" ${el.fontFamily === f ? 'selected' : ''}>${f}</option>`
        ).join('');
        html += row('Font', `<select style="width:100%" onchange="updateProp('${el.id}', 'fontFamily', this.value)">${fontOptions}</select>`);

        // Style Buttons
        html += `<div class="prop-row">
            <label>Style</label>
            <div class="icon-group">
                <button class="${el.fontWeight === 'bold' ? 'active' : ''}" 
                        onclick="updateProp('${el.id}', 'fontWeight', '${el.fontWeight === 'bold' ? 'normal' : 'bold'}')">B</button>
                <button class="${el.fontStyle === 'italic' ? 'active' : ''}" 
                        onclick="updateProp('${el.id}', 'fontStyle', '${el.fontStyle === 'italic' ? 'normal' : 'italic'}')">I</button>
            </div>
        </div>`;

        // Alignment Buttons
        html += `<div class="prop-row">
            <label>Align</label>
            <div class="icon-group">
                <button class="${el.textAlign === 'left' ? 'active' : ''}" onclick="updateProp('${el.id}', 'textAlign', 'left')">⇤</button>
                <button class="${el.textAlign === 'center' ? 'active' : ''}" onclick="updateProp('${el.id}', 'textAlign', 'center')">⇹</button>
                <button class="${el.textAlign === 'right' ? 'active' : ''}" onclick="updateProp('${el.id}', 'textAlign', 'right')">⇥</button>
            </div>
        </div>`;

        html += row('Size', `<input type="number" value="${el.fontSize}" oninput="updateProp('${el.id}', 'fontSize', this.value)">`);
        html += row('Color', `<input type="color" value="${el.color}" oninput="updateProp('${el.id}', 'color', this.value)">`);
        html += row('Rotation', `<input type="range" min="0" max="360" value="${el.rotation || 0}" oninput="updateProp('${el.id}', 'rotation', this.value)">`);
    }

    // ==========================================
    // 3. LINE PROPERTIES
    // ==========================================
    if (el.type === 'line') {
        html += section("Line Style");
        html += row('Width', `<input type="number" min="1" value="${el.strokeWidth}" oninput="updateProp('${el.id}', 'strokeWidth', this.value)">`);
        html += row('Color', `<input type="color" value="${el.strokeColor}" oninput="updateProp('${el.id}', 'strokeColor', this.value)">`);
        
        html += `<div class="prop-row"><label>Type</label>
            <select onchange="updateProp('${el.id}', 'strokeType', this.value)">
                <option value="solid" ${el.strokeType === 'solid' ? 'selected' : ''}>Solid</option>
                <option value="dashed" ${el.strokeType === 'dashed' ? 'selected' : ''}>Dashed</option>
                <option value="dotted" ${el.strokeType === 'dotted' ? 'selected' : ''}>Dotted</option>
            </select>
        </div>`;
    }

    // ==========================================
    // 4. BORDER & CORNERS (Restored)
    // ==========================================
    if (el.type !== 'text' && el.type !== 'line') {
        html += section("Border & Corners");
        html += row('Border W', `<input type="number" min="0" value="${el.strokeWidth}" oninput="updateProp('${el.id}', 'strokeWidth', this.value)">`);
        html += row('Border Color', `<input type="color" value="${el.strokeColor}" oninput="updateProp('${el.id}', 'strokeColor', this.value)">`);
        
        // INDIVIDUAL RADIUS TOGGLE
        html += row('Individual?', `<input type="checkbox" ${el.radiusIsIndividual ? 'checked' : ''} onchange="updateProp('${el.id}', 'radiusIsIndividual', this.checked)">`);

        if (el.radiusIsIndividual) {
            html += `<div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-bottom:10px;">
                ${row('TL', `<input type="number" value="${el.radiusTL}" oninput="updateProp('${el.id}', 'radiusTL', this.value)">`)}
                ${row('TR', `<input type="number" value="${el.radiusTR}" oninput="updateProp('${el.id}', 'radiusTR', this.value)">`)}
                ${row('BR', `<input type="number" value="${el.radiusBR}" oninput="updateProp('${el.id}', 'radiusBR', this.value)">`)}
                ${row('BL', `<input type="number" value="${el.radiusBL}" oninput="updateProp('${el.id}', 'radiusBL', this.value)">`)}
            </div>`;
        } else {
            html += row('Radius', `<input type="range" min="0" max="50" value="${el.radius}" oninput="updateProp('${el.id}', 'radius', this.value)">`);
        }
    }

    // ==========================================
    // 5. SHADOW (Restored)
    // ==========================================
    if (el.type !== 'line') {
        html += section("Shadow");
        html += row('Enable', `<input type="checkbox" ${el.hasShadow ? 'checked' : ''} onchange="updateProp('${el.id}', 'hasShadow', this.checked)">`);
        
        if (el.hasShadow) {
            html += row('X Offset', `<input type="number" value="${el.shadowX}" oninput="updateProp('${el.id}', 'shadowX', this.value)">`);
            html += row('Y Offset', `<input type="number" value="${el.shadowY}" oninput="updateProp('${el.id}', 'shadowY', this.value)">`);
            html += row('Blur', `<input type="number" min="0" value="${el.shadowBlur}" oninput="updateProp('${el.id}', 'shadowBlur', this.value)">`);
            html += row('Color', `<input type="color" value="${el.shadowColor}" oninput="updateProp('${el.id}', 'shadowColor', this.value)">`);
        }
    }

    // 5. INJECT HTML
    container.innerHTML = html;
}
// Universal updater function
function updateProp(id, key, value) {
    // Loop through ALL selected IDs, not just the single ID passed in
    selectedIds.forEach(targetId => {
        const el = currentDesign.elements.find(e => e.id === targetId);
        if (el) {
            // Type conversion logic
            let finalValue = value;
            if (['w', 'h', 'fontSize', 'strokeWidth', 'rotation', 'radius'].includes(key)) {
                finalValue = parseInt(value) || 0;
            } 
            else if (['lineHeight', 'letterSpacing'].includes(key)) {
                finalValue = parseFloat(value) || 0;
            }
            
            el[key] = finalValue;
        }
    });
    
    renderCanvas();
    renderPropertiesPanel(); // Refresh to show updated values
}
