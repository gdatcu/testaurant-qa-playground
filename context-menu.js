document.addEventListener('DOMContentLoaded', () => {
    const hotSpot = document.getElementById('hot-spot');
    const contextMenu = document.getElementById('context-menu');

    // Show the custom context menu
    hotSpot.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Prevent the default browser menu

        // Position the menu at the cursor's location
        contextMenu.style.top = `${e.pageY}px`;
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.classList.add('visible');
    });

    // Hide the menu when clicking anywhere else
    window.addEventListener('click', (e) => {
        if (contextMenu.classList.contains('visible')) {
            contextMenu.classList.remove('visible');
        }
    });

    // Handle clicks on menu items
    contextMenu.addEventListener('click', (e) => {
        const selectedAction = e.target.closest('.context-menu-item').dataset.action;
        if (selectedAction) {
            alert(`You clicked on: ${selectedAction}`);
        }
    });
});