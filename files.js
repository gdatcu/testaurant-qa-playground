document.addEventListener('DOMContentLoaded', () => {
    const fileUpload = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name');
    const uploadMessage = document.getElementById('upload-message');

    fileUpload.addEventListener('change', () => {
        if (fileUpload.files.length > 0) {
            const fileName = fileUpload.files[0].name;
            fileNameDisplay.textContent = fileName;
            uploadMessage.textContent = `File "${fileName}" selected and is ready to be uploaded.`;
            uploadMessage.style.display = 'block';
        } else {
            fileNameDisplay.textContent = 'No file selected';
            uploadMessage.style.display = 'none';
        }
    });
});