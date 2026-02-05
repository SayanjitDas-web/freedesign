// --- IMAGE UPLOAD LOGIC ---

function triggerAddImage() {
    document.getElementById('img-upload-input').click();
}

function handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        // Pass the image source (Base64 string) to addElement
        addElement('image', e.target.result);
    };
    reader.readAsDataURL(file);
    input.value = ''; // Reset so you can upload same file again
}