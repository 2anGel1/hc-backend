const selectedZoneStaff = new Set();
const selectedStaff = new Set();

var activeZone = { label: "" };

var allZoneStaff = new Array();
var allStaff = new Array();
var allZone = new Array();

var currentAllZoneStaff = new Array();
var currentAllStaff = new Array();

// GET

// all satff
async function fetchAllStaffData() {

    const loader = document.getElementById('loaderAllStaff');
    loader.classList.remove('hidden');

    if ($.fn.DataTable.isDataTable('#allStaffTable')) {
        $('#allStaffTable').DataTable().destroy();
        $('#allStaffTable').empty();
        $('#allStaffTable').append(`
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-2 text-xs border-b"></th>
                        <th class="px-4 py-2 text-xs border-b">#</th>
                        <th class="px-4 py-2 text-xs border-b">Nom et Prénoms</th>
                        <th class="px-4 py-2 text-xs border-b">Pôle</th>
                        <th class="px-4 py-2 text-xs border-b">Fonction</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `);
    }
    const table = document.querySelector('#allStaffTable');
    table.classList.add('hidden');

    await fetch(apiUrl.allStaff + activeEvent.id)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const staffData = await response.json();
            allStaff = staffData.map((staff) => staff);
            currentAllStaff = staffData.map((staff) => staff);
            populateAllStaffTable(allStaff);

        })
        .catch(error => {
            console.error(error.message);
            alert('Impossible de récupérer les données.');
        })
        .finally(() => {
            loader.classList.add('hidden');
            table.classList.remove('hidden');
        });
}

// all zone
async function fetchAllZoneData() {

    await fetch(apiUrl.allZone + activeEvent.id)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const zonesData = await response.json();
            allZone = zonesData.map(z => z);
            if (allZone.length != 0) {
                selectActiveZone(allZone[0]);
            }
            renderZones();

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

    if ($.fn.DataTable.isDataTable('#zoneStaffTable')) {
        $('#zoneStaffTable').DataTable().destroy();
        $('#zoneStaffTable').empty();
        $('#zoneStaffTable').append(`
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-2 text-xs border-b"></th>
                        <th class="px-4 py-2 text-xs border-b">#</th>
                        <th class="px-4 py-2 text-xs border-b">Nom et Prénoms</th>
                        <th class="px-4 py-2 text-xs border-b">Pôle</th>
                        <th class="px-4 py-2 text-xs border-b">Fonction</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `);
    }
    const table = document.querySelector('#zoneStaffTable');
    table.classList.add('hidden');

    await fetch(apiUrl.allZoneStaff + areaId)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const staffData = await response.json();
            allZoneStaff = staffData.map(staff => staff);
            currentAllZoneStaff = staffData.map(staff => staff);
            populateStaffZoneTable(allZoneStaff);

        })
        .catch(error => {
            console.error(error.message);
            alert('Impossible de récupérer les données.');
        })
        .finally(() => {
            loader.classList.add('hidden');
            table.classList.remove('hidden');
        });
}

// POST

async function associateStaffToArea(all = true, action = "associate") {

    startLoader();

    var liste = [];
    if (action == "associate") {
        liste = all ? currentAllStaff.map(el => el.id) : Array.from(selectedStaff);
    } else {
        liste = all ? currentAllZoneStaff.map(el => el.id) : Array.from(selectedZoneStaff);
    }

    var loaderId = "associateAllLoader"

    if (!all && action == "associate") {
        loaderId = "associateLoader";
    } else if (all && action != "associate") {
        loaderId = "dissociateAllLoader";
    } else if (!all && action != "associate") {
        loaderId = "dissociateLoader";
    }

    await Promise.all(
        liste.map(async (element) => {

            // setTimeout(async () => {

            const data = {
                area_id: activeZone.id,
                staff_id: element,
                action: action,
            }

            const request = await fetch(apiUrl.associateStaffToArea, {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                method: 'POST',
            })
                .then(response => {

                    // if (!response.ok) {
                    //     alert("Une erreur est survenue :");
                    // }

                })
                .catch(error => {
                    alert("Une erreur est survenue : " + error.message);
                })


            // }, 1000);

        })
    );

    if (!all && action == "associate") {
        document.getElementById('associateBtn').classList.add('hidden');
        document.getElementById('associateAllBtn').classList.remove('hidden');
    }

    if (!all && action != "associate") {
        document.getElementById('dissociateBtn').classList.add('hidden');
        document.getElementById('dissociateAllBtn').classList.remove('hidden');
    }

    fetchAllStaffData();
    fetchStaffZoneData(activeZone.id);

    stopLoader();

}

// POPULATE

// all staff table
function populateAllStaffTable(liste) {

    if ($.fn.DataTable.isDataTable('#allStaffTable')) {
        $('#allStaffTable').DataTable().destroy();
        $('#allStaffTable').empty();
        $('#allStaffTable').append(`
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-2 text-xs border-b"></th>
                        <th class="px-4 py-2 text-xs border-b">#</th>
                        <th class="px-4 py-2 text-xs border-b">Nom et Prénoms</th>
                        <th class="px-4 py-2 text-xs border-b">Pôle</th>
                        <th class="px-4 py-2 text-xs border-b">Fonction</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `);
    }

    const tableBody = document.querySelector('#allStaffTable tbody');
    tableBody.innerHTML = '';

    var num = 0;
    liste.forEach((staff) => {
        const row = document.createElement('tr');
        num += 1;
        row.innerHTML = `
            <td class="px-4 py-2 border-b">
                <input type="checkbox" id="check-${staff.id}" onchange="handleItemSelect('${staff.id}')">
            </td>
            <td class="px-4 py-2 text-xs border-b">${num}</td>
            <td class="px-4 py-2 text-xs border-b">${staff.names}</td>
            <td class="px-4 py-2 text-xs border-b">${staff.pole}</td>
            <td class="px-4 py-2 text-xs border-b">${staff.role}</td>
        `;
        tableBody.appendChild(row);
    });


    $('#allStaffTable').DataTable({
        searching: false,
        ordering: true,
        pageLength: 5,
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
function populateStaffZoneTable(liste = []) {

    if ($.fn.DataTable.isDataTable('#zoneStaffTable')) {
        $('#zoneStaffTable').DataTable().destroy();
        $('#zoneStaffTable').empty();
        $('#zoneStaffTable').append(`
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-2 text-xs border-b"></th>
                        <th class="px-4 py-2 text-xs border-b">#</th>
                        <th class="px-4 py-2 text-xs border-b">Nom et Prénoms</th>
                        <th class="px-4 py-2 text-xs border-b">Pôle</th>
                        <th class="px-4 py-2 text-xs border-b">Fonction</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `);
    }

    const tableBody = document.querySelector('#zoneStaffTable tbody');
    tableBody.innerHTML = '';

    var num = 0;
    liste.forEach((staff) => {
        const row = document.createElement('tr');
        num += 1;
        row.innerHTML = `
        <td class="px-4 py-2 border-b">
                <input type="checkbox" id="check-ds-${staff.id}" onchange="handleItemSelect2('${staff.id}')">
            </td>
            <td class="px-4 py-2 text-xs border-b">${num}</td>
            <td class="px-4 py-2 text-xs border-b">${staff.names}</td>
            <td class="px-4 py-2 text-xs border-b">${staff.pole}</td>
            <td class="px-4 py-2 text-xs border-b">${staff.role}</td>
        `;
        tableBody.appendChild(row);
    });

    $('#zoneStaffTable').DataTable({
        searching: false,
        ordering: true,
        pageLength: 5,
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

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = `px-4 py-2 text-xs font-bold
        hover:bg-[#dc1919] hover:text-white
        text-gray-900 border-gray-200
        border uppercase rounded-s`;

    removeBtn.textContent = "-";
    removeBtn.addEventListener("click", () => {
        document.getElementById('removeAreaModal').classList.remove('hidden');
    })
    zonesContainer.appendChild(removeBtn);

    allZone.forEach((zone, index) => {

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `px-4 py-2 text-xs border uppercase
            ${zone.id === activeZone.id ? 'text-white bg-gray-700 font-bold' : 'bg-white text-gray-900 border-gray-200'} 
            hover:bg-gray-700 hover:text-white hover:font-bold`;

        button.textContent = zone.label;
        button.addEventListener("click", () => {
            selectActiveZone(zone);
            renderZones();
        });

        zonesContainer.appendChild(button);

    });

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = `px-4 py-2 text-xs font-bold
        hover:bg-black hover:text-white
        text-gray-900 border-gray-200
        border uppercase rounded-e`;

    addBtn.textContent = "+";
    addBtn.addEventListener("click", () => {
        document.getElementById('addAreaModal').classList.remove('hidden');
    })
    zonesContainer.appendChild(addBtn);

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

// EVENT LISTENER

document.querySelector('#staffZoneSearch').addEventListener('input', (e) => {

    const searchParam = e.target.value.toLowerCase();

    const newListe = allZoneStaff.filter((staff) => {
        return (
            staff.names.toLowerCase().includes(searchParam) ||
            staff.id.toLowerCase().includes(searchParam) ||
            staff.pole.toLowerCase().includes(searchParam)
        )
    });

    currentAllZoneStaff = newListe.map(el => el);
    populateStaffZoneTable(newListe);

});

document.querySelector('#staffSearch').addEventListener('input', (e) => {

    const searchParam = e.target.value.toLowerCase();

    const newListe = allStaff.filter((staff) => {
        return (
            staff.names.toLowerCase().includes(searchParam) ||
            staff.id.toLowerCase().includes(searchParam) ||
            staff.pole.toLowerCase().includes(searchParam)
        )
    });

    currentAllStaff = newListe.map(el => el);
    populateAllStaffTable(newListe);

});

document.querySelector('#addAreaForm').addEventListener('submit', function (event) {

    event.preventDefault();

    const loader = document.getElementById('addAreaLoader');
    loader.classList.remove('hidden');

    const formData = new FormData(this);
    formData.append("event_id", activeEvent.id);
    const action = apiUrl.addAera;

    const data = Object.fromEntries(formData.entries());

    fetch(action, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        method: 'POST',
    })
        .then(response => {

            if (!response.ok) {
                alert("Erreur lors de l'ajout");
            }

        })
        .catch(error => {
            loader.classList.add('hidden');
            alert('Une erreur est survenue : ' + error.message);
        })
        .finally(() => {
            loader.classList.add('hidden');
            window.location.reload(true);
        });

});

document.querySelector('#removeAreaButton').addEventListener('click', function (event) {

    event.preventDefault();

    const loader = document.getElementById('removeAreaLoader');
    loader.classList.remove('hidden');

    const action = apiUrl.removeAera + activeZone.id;

    fetch(action, {
        headers: { 'Content-Type': 'application/json' },
        method: 'DELETE',
    })
        .then(response => {

            if (!response.ok) {
                alert("Erreur lors de la suppression");
            }

        })
        .catch(error => {
            alert('Une erreur est survenue : ' + error.message);
        })
        .finally(() => {
            window.location.reload(true);
        });

});

document.addEventListener('DOMContentLoaded', () => {
    fetchAllStaffData();
    fetchAllZoneData();
});

