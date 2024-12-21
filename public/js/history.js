

// FETCH

// all checkings
async function fetchHistoryData() {

    const loader = document.getElementById('loaderHistory');
    loader.classList.remove('hidden');

    if ($.fn.DataTable.isDataTable('#historyTable')) {
        $('#historyTable').DataTable().destroy();
        $('#historyTable').empty();
        $('#historyTable').append(`
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-2 text-xs border-b">#</th>
                        <th class="px-4 py-2 text-xs border-b">Terminal</th>
                        <th class="px-4 py-2 text-xs border-b">Nom et Prénoms</th>
                        <th class="px-4 py-2 text-xs border-b">Zone </th>
                        <th class="px-4 py-2 text-xs border-b">Status</th>
                        <th class="px-4 py-2 text-xs border-b">Heure</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `);
    }

    await fetch(apiUrl.getAllHistory + activeEvent.id)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const datas = await response.json();
            populateHistoryTable(datas);

        })
        .catch(error => {
            console.error(error.message);
            alert('Impossible de récupérer les données.');
        })
        .finally(() => {
            loader.classList.add('hidden');
        });
}

// POPULATE

// all checkings table
async function populateHistoryTable(liste = []) {

    const tableBody = document.querySelector('#historyTable tbody');
    tableBody.innerHTML = '';

    var num = 0;

    liste.forEach((checking) => {
        const row = document.createElement('tr');
        num += 1;

        const status = checking.success ?
            '<span class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Autorisé</span>' :
            '<span class="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Non autorisé</span>';

        row.innerHTML = `
                <td class="px-4 py-2 text-xs border-b">${num}</td>
                <td class="px-4 py-2 text-xs border-b">${checking.device}</td>
                <td class="px-4 py-2 text-xs border-b">${checking.staff.toUpperCase()}</td>
                <td class="px-4 py-2 text-xs border-b">${checking.aera.toUpperCase()}</td>
                <td class="px-4 py-2 text-xs border-b">${status}</td>
                <td class="px-4 py-2 text-xs border-b">${formatHour(checking.createdAt)}</td>
            `;

        tableBody.appendChild(row);
    });


    $('#historyTable').DataTable({
        searching: false,
        ordering: true,
        pageLength: 12,
        paging: true,
        language: {
            lengthMenu: "",
            zeroRecords: "Aucune donnée trouvée",
            info: "Page _PAGE_ sur _PAGES_",
            infoEmpty: "Aucune entrée disponible",
            infoFiltered: "(filtré parmi _MAX_ entrées totales)",
            search: "Rechercher :",
            paginate: {
                first: "Premier",
                last: "Dernier",
                next: "Suivant",
                previous: "Précédent"
            }
        }
    });

}

// EVENT LISTENER

document.addEventListener('DOMContentLoaded', () => {
    fetchHistoryData();
});