document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('ab-test-container');

    // Randomly choose between version A and B
    if (Math.random() < 0.5) {
        // --- Version A ---
        container.innerHTML = `
            <h3 class="version-a-header">Discover Our New Menu!</h3>
            <p>Experience the best flavors in town. Our new menu is designed to delight your senses.</p>
            <button class="btn version-a-btn">Explore Menu</button>
        `;
    } else {
        // --- Version B ---
        container.innerHTML = `
            <h3 class="version-b-header">Taste the Difference!</h3>
            <p>Our chefs have crafted a unique culinary journey just for you. Don't miss out!</p>
            <button class="btn version-b-btn">See Offers</button>
        `;
    }
});