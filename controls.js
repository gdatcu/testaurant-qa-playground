document.addEventListener('DOMContentLoaded', () => {
    const showSelectionBtn = document.getElementById('show-selection-btn');
    const selectionMessage = document.getElementById('selection-message');

    showSelectionBtn.addEventListener('click', () => {
        // --- Handle Checkboxes ---
        const checkedDietaryPrefs = [];
        const dietCheckboxes = document.querySelectorAll('input[name="diet"]:checked');
        dietCheckboxes.forEach(checkbox => {
            checkedDietaryPrefs.push(checkbox.value);
        });

        const dietResult = checkedDietaryPrefs.length > 0 
            ? `Dietary Preferences: ${checkedDietaryPrefs.join(', ')}` 
            : 'Dietary Preferences: None selected';

        // --- Handle Radio Buttons ---
        const selectedSize = document.querySelector('input[name="tshirt-size"]:checked');
        const sizeResult = `T-Shirt Size: ${selectedSize ? selectedSize.value : 'None selected'}`;

        // --- Display Results ---
        selectionMessage.innerHTML = `${dietResult}.<br>${sizeResult}.`;
        selectionMessage.style.display = 'block';
    });
});