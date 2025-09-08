document.addEventListener('DOMContentLoaded', () => {
    const doubleClickBox = document.getElementById('double-click-box');
    const resultText = document.getElementById('double-click-result');
    let clickTimeout = null;

    // Handle single clicks
    doubleClickBox.addEventListener('click', () => {
        // Use a timeout to differentiate from a double-click
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
            doubleClickBox.classList.add('clicked');
            resultText.textContent = 'Single click detected. Try a double-click!';
        }, 250); // 250ms window for a double-click
    });

    // Handle double-clicks
    doubleClickBox.addEventListener('dblclick', () => {
        clearTimeout(clickTimeout); // Prevent the single-click from firing
        doubleClickBox.style.backgroundColor = '#22c55e'; // Success green
        resultText.textContent = 'Success! Double-click event triggered.';
    });
});