document.addEventListener('DOMContentLoaded', () => {
    // --- Sample Data ---
    const sampleData = [
        { id: 1, first_name: "John", last_name: "Doe", email: "john.doe@example.com", city: "New York" },
        { id: 2, first_name: "Jane", last_name: "Smith", email: "jane.smith@example.com", city: "London" },
        { id: 3, first_name: "Peter", last_name: "Jones", email: "peter.jones@example.com", city: "Paris" },
        { id: 4, first_name: "Susan", last_name: "Williams", email: "susan.w@example.com", city: "Tokyo" },
        { id: 5, first_name: "David", last_name: "Brown", email: "david.b@example.com", city: "Sydney" },
        { id: 6, first_name: "Maria", last_name: "Garcia", email: "maria.g@example.com", city: "Madrid" },
        { id: 7, first_name: "Robert", last_name: "Miller", email: "robert.m@example.com", city: "Berlin" },
        { id: 8, first_name: "Linda", last_name: "Davis", email: "linda.d@example.com", city: "Toronto" },
        { id: 9, first_name: "Michael", last_name: "Wilson", email: "michael.w@example.com", city: "Moscow" },
        { id: 10, first_name: "Karen", last_name: "Taylor", email: "karen.t@example.com", city: "Rome" },
    ];

    let filteredData = [...sampleData];
    let currentPage = 1;
    const rowsPerPage = 5;

    const tableBody = document.getElementById('table-body');
    const searchInput = document.getElementById('table-search');
    const headers = document.querySelectorAll('.dynamic-table thead th');
    
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const pageIndicator = document.getElementById('page-indicator');

    // --- Core Render Function ---
    const renderTable = () => {
        tableBody.innerHTML = '';
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = filteredData.slice(start, end);

        paginatedData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.id}</td>
                <td>${row.first_name}</td>
                <td>${row.last_name}</td>
                <td>${row.email}</td>
                <td>${row.city}</td>
            `;
            tableBody.appendChild(tr);
        });
        updatePagination();
    };

    // --- Sorting ---
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            let order = header.dataset.order;

            // Toggle order
            order = order === 'desc' ? 'asc' : 'desc';
            header.dataset.order = order;

            // Update arrow indicator
            headers.forEach(h => h.innerHTML = h.innerHTML.replace(/[▲▼]/g, ''));
            header.innerHTML += order === 'desc' ? ' &#9662;' : ' &#9652;';

            filteredData.sort((a, b) => {
                if (a[column] < b[column]) return order === 'asc' ? -1 : 1;
                if (a[column] > b[column]) return order === 'asc' ? 1 : -1;
                return 0;
            });

            renderTable();
        });
    });

    // --- Filtering ---
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        filteredData = sampleData.filter(row => 
            Object.values(row).some(value => 
                String(value).toLowerCase().includes(query)
            )
        );
        currentPage = 1; // Reset to first page after search
        renderTable();
    });

    // --- Pagination ---
    const updatePagination = () => {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages || 1}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    };

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    // --- Initial Render ---
    renderTable();
});