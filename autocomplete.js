document.addEventListener('DOMContentLoaded', () => {
    const countries = ["United States", "United Kingdom", "United Arab Emirates", "Canada", "Australia", "Germany", "France", "Japan", "Brazil", "India"];
    
    const input = document.getElementById('autocomplete-input');
    const resultsContainer = document.getElementById('autocomplete-results');

    input.addEventListener('input', () => {
        const query = input.value.toLowerCase();
        resultsContainer.innerHTML = ''; // Clear previous results

        if (query.length === 0) {
            return;
        }

        const filteredCountries = countries.filter(country => 
            country.toLowerCase().includes(query)
        );

        filteredCountries.forEach(country => {
            const div = document.createElement('div');
            div.textContent = country;
            div.addEventListener('click', () => {
                input.value = country;
                resultsContainer.innerHTML = '';
            });
            resultsContainer.appendChild(div);
        });
    });
    
    // Close dropdown if user clicks elsewhere
    document.addEventListener('click', (e) => {
        if (e.target.id !== 'autocomplete-input') {
            resultsContainer.innerHTML = '';
        }
    });
});