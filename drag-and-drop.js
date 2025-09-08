document.addEventListener('DOMContentLoaded', () => {
    const draggableItem = document.getElementById('draggable-item');
    const dropBoxes = document.querySelectorAll('.drop-box');
    const resultText = document.getElementById('drop-result');

    // --- Draggable Item Event ---
    draggableItem.addEventListener('dragstart', (e) => {
        // This is needed for Firefox
        e.dataTransfer.setData('text/plain', e.target.id); 
    });
    
    // --- Drop Boxes Events ---
    dropBoxes.forEach(box => {
        box.addEventListener('dragenter', (e) => {
            e.preventDefault();
            box.classList.add('hovered');
        });

        box.addEventListener('dragover', (e) => {
            e.preventDefault(); // This is necessary to allow dropping
        });

        box.addEventListener('dragleave', () => {
            box.classList.remove('hovered');
        });

        box.addEventListener('drop', (e) => {
            e.preventDefault();
            box.classList.remove('hovered');
            
            // Append the draggable item to the new box
            box.appendChild(draggableItem);

            // Provide feedback
            if (box.id === 'target-box') {
                resultText.textContent = 'Item successfully dropped in the target box!';
            } else {
                resultText.textContent = 'Item returned to the source box.';
            }
        });
    });
});