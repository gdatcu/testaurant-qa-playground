document.addEventListener('DOMContentLoaded', () => {
    const slowBtn = document.getElementById('slow-btn');
    const contentPlaceholder = document.getElementById('slow-content-placeholder');
    const resultText = document.getElementById('action-result');

    // --- Slow Button Logic ---
    setTimeout(() => {
        slowBtn.disabled = false;
        slowBtn.textContent = 'Click Me Now';
    }, 3000); // 3 seconds

    slowBtn.addEventListener('click', () => {
        resultText.textContent = 'Slow button was successfully clicked!';
    });

    // --- Slow Content Logic ---
    setTimeout(() => {
        const newContent = document.createElement('p');
        newContent.textContent = 'The slow content has arrived!';
        newContent.classList.add('loaded-content-slow');
        contentPlaceholder.appendChild(newContent);
    }, 4000); // 4 seconds
});