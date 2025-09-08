document.addEventListener('DOMContentLoaded', () => {
    const alertBtn = document.getElementById('alert-btn');
    const confirmBtn = document.getElementById('confirm-btn');
    const promptBtn = document.getElementById('prompt-btn');
    const alertResult = document.getElementById('alert-result');

    alertBtn.addEventListener('click', () => {
        alert("This is a simple alert!");
        alertResult.textContent = 'Alert was shown.';
    });

    confirmBtn.addEventListener('click', () => {
        const result = confirm("Do you confirm this action?");
        if (result) {
            alertResult.textContent = 'You pressed OK!';
        } else {
            alertResult.textContent = 'You pressed Cancel!';
        }
    });

    promptBtn.addEventListener('click', () => {
        const result = prompt("Please enter your name:", "Test User");
        if (result === null || result === "") {
            alertResult.textContent = "User cancelled the prompt.";
        } else {
            alertResult.textContent = `Hello, ${result}!`;
        }
    });
});