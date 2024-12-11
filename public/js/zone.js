const apiUrl = {
    associateStaffToArea: '/api/admin/area/associate',
    allZoneStaff: '/api/admin/area/get-staff/',
    allStaff: '/api/admin/staff/get-all',
    allZone: '/api/admin/area/get-all',
};

const selectedZoneStaff = new Set();
const selectedStaff = new Set();
var activeZone = { label: "" };
var allZoneStaff = new Array();
var allStaff = new Array();
var allZone = new Array();


// GET

// all satff
async function fetchAllStaffData() {

    const loader = document.getElementById('loaderAllStaff');
    loader.classList.remove('hidden');

    await fetch(apiUrl.allStaff)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const staffData = await response.json();
            allStaff = [];
            staffData.forEach((staff) => {
                allStaff.push(staff);
            })
            populateAllStaffTable();

        })
        .catch(error => {
            console.error(error.message);
            alert('Impossible de récupérer les données.');
        })
        .finally(() => {
            loader.classList.add('hidden');
        });
}

// all zone
async function fetchAllZoneData() {

    // const tableLoader = document.getElementById('loader-table');
    // tableLoader.classList.remove('hidden');

    await fetch(apiUrl.allZone)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const zonesData = await response.json();
            allZone = zonesData.map(z => z);
            if (allZone.length != 0) {
                selectActiveZone(allZone[0]);
                renderZones();
            }

        })
        .catch(error => {
            console.error(error.message);
            alert('Impossible de récupérer les données.');
        })
        .finally(() => {
            // tableLoader.classList.add('hidden');
        });
}

// all staff-zone
async function fetchStaffZoneData(areaId) {

    const loader = document.getElementById('loaderAllStaffZone');
    loader.classList.remove('hidden');

    await fetch(apiUrl.allZoneStaff + areaId)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const staffData = await response.json();
            allZoneStaff = staffData.map(staff => staff);
            populateStaffZoneTable();

        })
        .catch(error => {
            console.error(error.message);
            alert('Impossible de récupérer les données.');
        })
        .finally(() => {
            loader.classList.add('hidden');
        });
}

// POST

async function associateStaffToArea(all = true, action = "associate") {

    var liste = [];
    if (action == "associate") {
        liste = all ? allStaff.map(el => el.id) : Array.from(selectedStaff);
    } else {
        liste = all ? allZoneStaff.map(el => el.id) : Array.from(selectedZoneStaff);
    }

    var loaderId = "associateAllLoader"

    if (!all && action == "associate") {
        loaderId = "associateLoader";
    } else if (all && action != "associate") {
        loaderId = "dissociateAllLoader";
    } else if (!all && action != "associate") {
        loaderId = "dissociateLoader";
    }
    const loader = document.getElementById(loaderId);
    loader.classList.remove('hidden');

    await Promise.all(
        liste.map(async (element) => {

            const data = {
                area_id: activeZone.id,
                action: action,
                staff_id: element,
            }

            await fetch(apiUrl.associateStaffToArea, {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                method: 'POST',
            })
                .then(response => {

                    if (!response.ok) {
                        alert("Une erreur est survenue :");
                    }

                })
                .catch(error => {
                    alert("Une erreur est survenue : " + error.message);
                })
                .finally(() => {

                });

        })
    );

    loader.classList.add('hidden');
    if (loaderId == "associateLoader") {
        document.getElementById('associateBtn').classList.add('hidden');
        document.getElementById('associateAllBtn').classList.remove('hidden');
    }

    if (loaderId == "dissociateLoader") {
        document.getElementById('dissociateBtn').classList.add('hidden');
        document.getElementById('dissociateAllBtn').classList.remove('hidden');
    }

    fetchAllStaffData();
    fetchStaffZoneData(activeZone.id);

}

// POPULATE

// all staff table
function populateAllStaffTable() {

    if ($.fn.DataTable.isDataTable('#allStaffTable')) {
        $('#allStaffTable').DataTable().destroy();
        $('#allStaffTable').empty();
        $('#allStaffTable').append(`
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-2 text-sm border-b"></th>
                        <th class="px-4 py-2 text-sm border-b">#</th>
                        <th class="px-4 py-2 text-sm border-b">Nom et Prénoms</th>
                        <th class="px-4 py-2 text-sm border-b">Pôle</th>
                        <th class="px-4 py-2 text-sm border-b">Fonction</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `);
    }

    const tableBody = document.querySelector('#allStaffTable tbody');
    tableBody.innerHTML = '';

    var num = 0;
    allStaff.forEach((staff) => {
        const row = document.createElement('tr');
        num += 1;
        row.innerHTML = `
            <td class="px-4 py-2 border-b">
                <input type="checkbox" id="check-${staff.id}" onchange="handleItemSelect('${staff.id}')">
            </td>
            <td class="px-4 py-2 text-sm border-b">${num}</td>
            <td class="px-4 py-2 text-sm border-b">${staff.names}</td>
            <td class="px-4 py-2 text-sm border-b">${staff.pole}</td>
            <td class="px-4 py-2 text-sm border-b">${staff.role}</td>
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

// all staff-zone table
function populateStaffZoneTable() {

    if ($.fn.DataTable.isDataTable('#zoneStaffTable')) {
        $('#zoneStaffTable').DataTable().destroy();
        $('#zoneStaffTable').empty();
        $('#zoneStaffTable').append(`
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-2 text-sm border-b"></th>
                        <th class="px-4 py-2 text-sm border-b">#</th>
                        <th class="px-4 py-2 text-sm border-b">Nom et Prénoms</th>
                        <th class="px-4 py-2 text-sm border-b">Pôle</th>
                        <th class="px-4 py-2 text-sm border-b">Fonction</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `);
    }

    const tableBody = document.querySelector('#zoneStaffTable tbody');
    tableBody.innerHTML = '';

    var num = 0;
    allZoneStaff.forEach((staff) => {
        const row = document.createElement('tr');
        num += 1;
        row.innerHTML = `
        <td class="px-4 py-2 border-b">
                <input type="checkbox" id="check-ds-${staff.id}" onchange="handleItemSelect2('${staff.id}')">
            </td>
            <td class="px-4 py-2 text-sm border-b">${num}</td>
            <td class="px-4 py-2 text-sm border-b">${staff.names}</td>
            <td class="px-4 py-2 text-sm border-b">${staff.pole}</td>
            <td class="px-4 py-2 text-sm border-b">${staff.role}</td>
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

// OTHER

function renderZones() {

    const zonesContainer = document.getElementById('zones-container');

    zonesContainer.innerHTML = '';

    allZone.forEach((zone, index) => {

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `px-4 py-2 text-sm font-medium border bg-gray-100
            ${index === 0 ? 'rounded-s-lg' : ''} 
            ${index === allZone.length - 1 ? 'rounded-e-lg' : ''} 
            hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700`;
        // ${zone.id === activeZone.id ? 'text-blue-700 bg-gray-100' : 'bg-white text-gray-900 border-gray-200'} 

        button.textContent = zone.label;
        button.addEventListener("click", () => {
            selectActiveZone(zone);
            renderZones();
        })
        zonesContainer.appendChild(button);
    });

}

function selectActiveZone(area) {
    activeZone = area;
    fetchStaffZoneData(area.id);
}

async function handleItemSelect(staffId) {

    const checkbox = document.getElementById(`check-${staffId}`);
    if (checkbox.checked) {
        selectedStaff.add(staffId);
    } else {
        selectedStaff.delete(staffId);
    }

    const associateBtn = document.getElementById('associateBtn');
    if (selectedStaff.size != 0) {
        if (associateBtn.classList.contains('hidden'))
            associateBtn.classList.remove('hidden');
    } else {
        if (!associateBtn.classList.contains('hidden'))
            associateBtn.classList.add('hidden');
    }

    const associateBtnAll = document.getElementById('associateAllBtn');
    if (selectedStaff.size == 0) {
        if (associateBtnAll.classList.contains('hidden'))
            associateBtnAll.classList.remove('hidden');
    } else {
        if (!associateBtnAll.classList.contains('hidden'))
            associateBtnAll.classList.add('hidden');
    }

}

async function handleItemSelect2(staffId) {

    const checkbox = document.getElementById(`check-ds-${staffId}`);
    if (checkbox.checked) {
        selectedZoneStaff.add(staffId);
    } else {
        selectedZoneStaff.delete(staffId);
    }
    
    const associateBtn = document.getElementById('dissociateBtn');
    if (selectedZoneStaff.size != 0) {
        if (associateBtn.classList.contains('hidden'))
            associateBtn.classList.remove('hidden');
    } else {
        if (!associateBtn.classList.contains('hidden'))
            associateBtn.classList.add('hidden');
    }

    const associateBtnAll = document.getElementById('dissociateAllBtn');
    if (selectedZoneStaff.size == 0) {
        if (associateBtnAll.classList.contains('hidden'))
            associateBtnAll.classList.remove('hidden');
    } else {
        if (!associateBtnAll.classList.contains('hidden'))
            associateBtnAll.classList.add('hidden');
    }

}

// INIT

document.addEventListener('DOMContentLoaded', () => {
    fetchAllStaffData();
    fetchAllZoneData();
});
