document.addEventListener('DOMContentLoaded', () => {
    // --- Date Picker ---
    new Pikaday({
        field: document.getElementById('datepicker'),
        format: 'YYYY-MM-DD',
        toString(date, format) {
            return moment(date).format(format);
        }
    });

    // --- Slider ---
    const slider = document.getElementById("myRange");
    const sliderValue = document.getElementById("sliderValue");
    sliderValue.innerHTML = slider.value; // Display the default slider value

    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function() {
        sliderValue.innerHTML = this.value;
    }

    // --- Progress Bar ---
    const startStopBtn = document.getElementById("startStopBtn");
    const myBar = document.getElementById("myBar");
    let width = 0;
    let intervalId = null;

    startStopBtn.addEventListener("click", () => {
        if (intervalId) {
            // If it's running, stop it
            clearInterval(intervalId);
            intervalId = null;
            startStopBtn.textContent = "Start";
        } else {
            // If it's stopped, start it
            width = 0; // Reset
            startStopBtn.textContent = "Stop";
            intervalId = setInterval(frame, 50); // Run frame() every 50ms
        }
    });

    function frame() {
        if (width >= 100) {
            clearInterval(intervalId);
            intervalId = null;
            startStopBtn.textContent = "Start";
        } else {
            width++;
            myBar.style.width = width + "%";
            myBar.innerHTML = width + "%";
        }
    }
});