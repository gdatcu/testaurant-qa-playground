document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const submitBtn = document.getElementById('submit-btn');
    const displayedMessage = document.getElementById('displayed-message');

    submitBtn.addEventListener('click', () => {
        const message = messageInput.value;
        if (message.trim() !== '') {
            displayedMessage.textContent = message;
            messageInput.value = ''; // Clear the input after displaying
        } else {
            displayedMessage.textContent = 'Please enter a message first.';
        }
    });

    // Also allow submission on pressing Enter in the input field
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            submitBtn.click();
        }
    });
});