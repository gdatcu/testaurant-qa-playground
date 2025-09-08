document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    const confirmBtn = document.getElementById('show-choice-btn');
    const resultText = document.getElementById('dropdown-result');

    confirmBtn.addEventListener('click', () => {
        const selectedValue = languageSelect.value;
        const selectedIndex = languageSelect.selectedIndex;
        const selectedText = languageSelect.options[selectedIndex].text;

        if (selectedValue) {
            resultText.textContent = `You selected: "${selectedText}" (value: ${selectedValue}).`;
        } else {
            resultText.textContent = 'Please select a language.';
        }
    });
});