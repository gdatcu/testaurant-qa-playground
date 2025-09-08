document.addEventListener('DOMContentLoaded', () => {
    // --- Canvas Logic ---
    const canvas = document.getElementById('my-canvas');
    const ctx = canvas.getContext('2d');
    const drawBtn = document.getElementById('draw-btn');
    const clearBtn = document.getElementById('clear-btn');

    drawBtn.addEventListener('click', () => {
        ctx.fillStyle = '#3b82f6';
        // Draw a rectangle at x=20, y=20 with width=50 and height=50
        ctx.fillRect(20, 20, 50, 50); 
    });

    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // --- SVG Logic ---
    const svgRect = document.getElementById('svg-rect');
    const svgCircle = document.getElementById('svg-circle');
    const svgResult = document.getElementById('svg-result');

    svgRect.addEventListener('click', () => {
        svgResult.textContent = 'You clicked the SVG Rectangle!';
    });

    svgCircle.addEventListener('click', () => {
        svgResult.textContent = 'You clicked the SVG Circle!';
    });
});