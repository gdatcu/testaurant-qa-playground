document.addEventListener('DOMContentLoaded', () => {
    const keyInput = document.getElementById('key-input');
    const keyResult = document.getElementById('key-result');

    keyInput.addEventListener('keydown', (event) => {
        // We use event.key to get the character of the key pressed.
        // event.code gives the physical key code (e.g., "KeyA", "Digit1", "Space").
        
        let keyInfo = `You pressed: <strong style="color: #6aa5ff;">${event.key}</strong> (code: ${event.code})`;
        
        // Clear the input to focus on one key press at a time
        keyInput.value = '';

        keyResult.innerHTML = keyInfo;

        // Prevent the default action to avoid typing in the input field
        event.preventDefault();
    });
});