document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.getElementById('scroll-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    let isLoading = false;
    let itemCount = 1;

    // Function to add new items to the container
    const addMoreItems = () => {
        isLoading = true;
        loadingIndicator.style.display = 'block';

        // Simulate a network delay
        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                const newItem = document.createElement('div');
                newItem.classList.add('scroll-item');
                newItem.textContent = `Item #${itemCount++}`;
                scrollContainer.appendChild(newItem);
            }
            isLoading = false;
            loadingIndicator.style.display = 'none';
        }, 1000); // 1-second delay
    };

    // Listen for scroll events on the container
    scrollContainer.addEventListener('scroll', () => {
        // Check if the user is near the bottom
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
            addMoreItems();
        }
    });

    // Load initial items
    addMoreItems();
});