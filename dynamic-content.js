document.addEventListener('DOMContentLoaded', () => {
    const loadBtn = document.getElementById('load-content-btn');
    const contentArea = document.getElementById('content-area');

    loadBtn.addEventListener('click', () => {
        // 1. Show a loading message and disable the button
        contentArea.innerHTML = '<p>Loading...</p>';
        contentArea.classList.add('loading');
        loadBtn.disabled = true;

        // 2. Simulate a network delay (e.g., 2 seconds)
        setTimeout(() => {
            // 3. Load the new content
            contentArea.innerHTML = `
                <div class="loaded-content">
                    <h4>Content Loaded!</h4>
                    <p>This content was added to the page after a delay.</p>
                    <img src="logo/testaurant_logo.png" alt="Testaurant Logo">
                </div>
            `;
            contentArea.classList.remove('loading');
            loadBtn.disabled = false; // Re-enable the button
        }, 2000); // 2000 milliseconds = 2 seconds
    });
});