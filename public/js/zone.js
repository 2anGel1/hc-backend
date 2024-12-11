const apiUrl = {
    allZoneStaff: '/api/admin/area/get-staff/',
    allStaff: '/api/admin/staff/get-all',
    allZone: '/api/admin/area/get-all',
};

var activeZone = { label: "" };

async function fetchAllStaffData() {

    // const tableLoader = document.getElementById('loader-table');
    // tableLoader.classList.remove('hidden');

    await fetch(apiUrl.allStaff)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const staffData = await response.json();

            populateAllStaffTable(staffData);

        })
        .catch(error => {
            console.error(error.message);
            alert('Impossible de récupérer les données.');
        })
        .finally(() => {
            // tableLoader.classList.add('hidden');
        });
}

async function fetchAllZoneData() {

    // const tableLoader = document.getElementById('loader-table');
    // tableLoader.classList.remove('hidden');

    await fetch(apiUrl.allZone)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const zonesData = await response.json();
            const zonesContainer = document.getElementById('zones-container');

            console.log(zonesData);
            if (zonesData.length != 0) {
                selectActiveZone(zonesData[0]);
            }

            zonesContainer.innerHTML = '';

            zonesData.forEach((zone, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = `px-4 py-2 text-sm font-medium text-gray-900 bg-white border ${index === 0 ? 'rounded-s-lg' : '' // Bouton de début
                    } ${index === zonesData.length - 1 ? 'rounded-e-lg' : ''
                    } border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white`;
                button.textContent = zone.label;
                button.addEventListener("click", () => {
                    selectActiveZone(zone);
                })
                zonesContainer.appendChild(button);
            });

        })
        .catch(error => {
            console.error(error.message);
            alert('Impossible de récupérer les données.');
        })
        .finally(() => {
            // tableLoader.classList.add('hidden');
        });
}

async function fetchStaffZoneData(areaId) {

    // const tableLoader = document.getElementById('loader-table');
    // tableLoader.classList.remove('hidden');

    await fetch(apiUrl.allZoneStaff + areaId)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const staffData = await response.json();

            populateStaffZoneTable(staffData);

        })
        .catch(error => {
            console.error(error.message);
            alert('Impossible de récupérer les données.');
        })
        .finally(() => {
            // tableLoader.classList.add('hidden');
        });
}

function populateAllStaffTable(staffList) {
    const tableBody = document.querySelector('#allStaffTable tbody');
    tableBody.innerHTML = ''; // Vide le tableau avant de le remplir

    var num = 0;
    staffList.forEach((staff) => {
        const row = document.createElement('tr');
        num += 1;
        row.innerHTML = `
            <td class="px-4 py-2 border-b">${num}</td>
            <td class="px-4 py-2 border-b">${staff.names}</td>
            <td class="px-4 py-2 border-b">${staff.pole}</td>
            <td class="px-4 py-2 border-b">${staff.role}</td>
            <td class="px-4 py-2 border-b">Ajouter</td>
        `;
        tableBody.appendChild(row);
    });

    $('#allStaffTable').DataTable({
        searching: false,
        ordering: true,
        pageLength: 7,
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

function populateStaffZoneTable(staffList) {
    const tableBody = document.querySelector('#zoneStaffTable tbody');
    tableBody.innerHTML = '';

    var num = 0;
    staffList.forEach((staff) => {
        const row = document.createElement('tr');
        num += 1;
        row.innerHTML = `
            <td class="px-4 py-2 border-b">${num}</td>
            <td class="px-4 py-2 border-b">${staff.names}</td>
            <td class="px-4 py-2 border-b">${staff.pole}</td>
            <td class="px-4 py-2 border-b">${staff.role}</td>
        `;
        tableBody.appendChild(row);
    });

    $('#zoneStaffTable').DataTable({
        searching: false,
        ordering: true,
        pageLength: 7,
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

function selectActiveZone(area) {
    activeZone = area;
    fetchStaffZoneData(area.id);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAllStaffData();
    fetchAllZoneData();
});
