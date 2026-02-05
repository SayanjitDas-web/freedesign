// ==========================================
// AI GENERATION LOGIC (Gemini + Pollinations)
// ==========================================

// --- 1. SETTINGS & KEYS ---

function openSettings() {
    const modal = document.getElementById('settings-modal');
    // Load saved keys
    document.getElementById('gemini-key-input').value = localStorage.getItem('gemini_api_key') || '';
    document.getElementById('pollinations-key-input').value = localStorage.getItem('pollinations_api_key') || '';
    modal.showModal();
}

function saveSettings() {
    const geminiKey = document.getElementById('gemini-key-input').value.trim();
    const pollinationsKey = document.getElementById('pollinations-key-input').value.trim();
    
    if (geminiKey) localStorage.setItem('gemini_api_key', geminiKey);
    if (pollinationsKey) localStorage.setItem('pollinations_api_key', pollinationsKey);
    
    alert("Keys Saved!");
    closeSettings();
}

async function fetchPollinationsImage(prompt) {
    const apiKey = localStorage.getItem('pollinations_api_key');
    if (!apiKey) throw new Error("Missing Pollinations API Key");

    const encodedPrompt = encodeURIComponent(prompt);
    // Using the 'flux' model as per your screenshot reference
    const url = `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            // 'User-Agent': 'DesignEditor/1.0' // Sometimes helpful but optional
        }
    });

    if (!response.ok) {
        throw new Error(`Pollinations Error: ${response.statusText}`);
    }

    // Convert the raw image data (Blob) into a URL we can use in <img src="...">
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

// --- 2. THE GENERATOR (PRO VERSION) ---
async function generateDesign() {
    const promptInput = document.getElementById('ai-prompt');
    const userPrompt = promptInput.value.trim();
    const btn = document.getElementById('btn-generate');
    
    const geminiKey = localStorage.getItem('gemini_api_key');
    const pollinationsKey = localStorage.getItem('pollinations_api_key');

    // Validation
    if (!userPrompt) return alert("Please describe a design first!");
    if (!geminiKey) return alert("Please add your Gemini API Key in Settings.");
    if (!pollinationsKey) return alert("Please add your Pollinations API Key in Settings.");

    // UI Loading State
    btn.disabled = true;
    btn.innerText = "Dreaming...";
    
    try {
        // A. ADVANCED SYSTEM PROMPT
        const systemInstruction = `
            ROLE: You are an expert Art Director and UI Designer. 
            TASK: Create a professional design JSON based on the user's request: "${userPrompt}"

            GUIDELINES FOR LAYOUT:
            1. **Visual Hierarchy**: Create a strong focal point. Usually a large "Hero Image" or a bold "Headline".
            2. **Contrast**: Ensure text color contrasts well with the background. (e.g., Dark background = White text).
            3. **Spacing**: Don't cluster elements. Use the full 800x600 canvas.
            4. **Complexity**: Use at least 3-5 elements (Background, Main Image, Title, Subtitle, Decorative Shape).

            GUIDELINES FOR IMAGES (CRITICAL):
            1. You must write "Pollinations Prompts" that are highly detailed.
            2. DO NOT just write "a car". 
            3. WRITE: "futuristic sports car, neon city background, cyberpunk style, cinematic lighting, 8k resolution, hyper-realistic".
            4. Add keywords like: "vector art", "minimalist", "3d render", or "oil painting" based on the user's vibe.

            SCHEMA (Strict JSON):
            {
                "name": "AI Design",
                "width": 800, "height": 600, 
                "backgroundColor": "#hex_code",
                "elements": [
                    { 
                        "type": "rect" | "circle" | "text" | "image", 
                        "x": number, "y": number, "w": number, "h": number, 
                        "fill": "#hex" (for shapes), 
                        "rotation": number (0-360), 
                        "opacity": number (0.1-1.0),
                        
                        // Text Specifics
                        "content": "String", "fontSize": number, "color": "#hex",
                        "fontWeight": "bold" | "normal", "textAlign": "left" | "center" | "right",
                        
                        // Image Specifics
                        "src": "pollinations: {DETAILED_PROMPT_HERE}",
                        "radius": number (0-50)
                    }
                ]
            }
            
            OUTPUT RULES:
            - Output ONLY raw JSON. No markdown formatting (no \`\`\`json).
            - If the user asks for a specific theme (e.g., "Retro"), strictly follow that color palette and font style.
        `;

        // B. CALL GEMINI
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemInstruction }] }] })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        // C. PARSE JSON
        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiDesign = JSON.parse(rawText);

        // D. PROCESS IMAGES (With Context)
        if (aiDesign.elements) {
            for (let el of aiDesign.elements) {
                if (el.type === 'image' && el.src && el.src.startsWith('pollinations:')) {
                    const imagePrompt = el.src.replace('pollinations:', '').trim();
                    console.log("Generating Image for:", imagePrompt); // Debug log
                    
                    try {
                        // Pass the AI's enhanced prompt to Pollinations
                        el.src = await fetchPollinationsImage(imagePrompt);
                    } catch (imgErr) {
                        console.error("Failed to load image:", imgErr);
                        el.src = "https://placehold.co/400?text=AI+Error"; 
                    }
                }
            }
        }

        // E. CREATE DESIGN
        const newId = Date.now().toString();
        aiDesign.id = newId;
        aiDesign.lastSaved = Date.now();
        
        // Sanitize Elements (Safety check for missing properties)
        if(aiDesign.elements) {
            aiDesign.elements.forEach((el, i) => {
                el.id = 'el-' + newId + '-' + i;
                if(el.type === 'text') {
                    if(!el.fontSize) el.fontSize = 40;
                    if(!el.fontFamily) el.fontFamily = 'Roboto'; // Default font
                }
                if(el.type === 'rect' || el.type === 'circle') {
                    if(!el.radius) el.radius = 0;
                }
                if(!el.visible) el.visible = true;
                if(el.opacity === undefined) el.opacity = 1;
                if(!el.rotation) el.rotation = 0;
            });
        }

        designs.push(aiDesign);
        saveToLocal();
        openDesign(newId);

    } catch (err) {
        console.error(err);
        alert("AI Error: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Generate";
    }
}