document.addEventListener('DOMContentLoaded', () => {
    const host = document.getElementById('shadow-host');
    const resultText = document.getElementById('shadow-result');

    // Create a shadow root
    const shadowRoot = host.attachShadow({ mode: 'open' });

    // Create elements inside the shadow root
    const heading = document.createElement('h3');
    heading.textContent = 'Content inside Shadow DOM';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'shadow-input';
    input.placeholder = 'Type here to see it reflected...';

    // Style the elements inside the shadow root
    const style = document.createElement('style');
    style.textContent = `
        h3 { color: #e9eefb; }
        input {
            width: 95%;
            padding: 10px 12px;
            background: #0b1330;
            border: 1px solid rgba(255, 255, 255, .2);
            border-radius: 10px;
            color: #e9eefb;
        }
    `;
    
    input.addEventListener('input', () => {
        resultText.textContent = `Text from shadow input: ${input.value}`;
    });

    shadowRoot.appendChild(style);
    shadowRoot.appendChild(heading);
    shadowRoot.appendChild(input);
});