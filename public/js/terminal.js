var activeZone = { label: "" };
var allDevice = new Array();
var allZone = new Array();
var currentDevice = {};

// GET

// all zone
async function fetchAllZoneData() {

    await fetch(apiUrl.allZoneWithout + activeEvent.id)

        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const zonesData = await response.json();
            allZone = zonesData.map(z => z);
            if (allZone.length != 0) {
                selectActiveZone(allZone[0]);
            } else {
                populateDeviceTable();
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

// all devices of zone
async function fetchDevicesData() {

    const loader = document.getElementById('loaderAllDevice');
    loader.classList.remove('hidden');

    if ($.fn.DataTable.isDataTable('#deviceTable')) {
        $('#deviceTable').DataTable().destroy();
        $('#deviceTable').empty();
        $('#deviceTable').append(`
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-2 text-xs border-b">#</th>
                        <th class="px-4 py-2 text-xs border-b">Nom du terminal</th>
                        <th class="px-4 py-2 text-xs border-b">Utilisateur</th>
                        <th class="px-4 py-2 text-xs border-b">Status</th>
                        <th class="px-4 py-2 text-xs border-b">Action</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `);
    }

    const table = document.querySelector('#deviceTable');
    table.classList.add('hidden');

    await fetch(apiUrl.allDevice + activeZone.id)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const deviceData = await response.json();
            allDevice = deviceData.map(staff => staff);
            populateDeviceTable(allDevice);

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

// POPULATE

// all staff-zone table
async function populateDeviceTable(liste = []) {

    const tableBody = document.querySelector('#deviceTable tbody');
    tableBody.innerHTML = '';

    var num = 0;
    await Promise.all(

        liste.map((device) => {
            const row = document.createElement('tr');
            num += 1;

            var action = null;
            if (device.active) {
                action = `
                    <button type="button" onclick="toogleDevice('${device.id}', 'disable')"
                        class="inline-flex w-[90px] h-full flex justify-center items-center rounded bg-red-800 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-600">
                        Déseactiver
                    </button>
                `
            } else {
                action = `
                    <button type="button" onclick="toogleDevice('${device.id}')"
                        class="inline-flex w-[90px] h-full flex justify-center items-center rounded bg-green-800 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-green-600">
                        Activer
                    </button>
                `
            }

            const showBtn = `
            <button type="button" onclick="showDevice('${device.id}')" data-tooltip-target="tooltip-default"
                class="inline-flex items-center rounded bg-gray-800 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                    Modifier
            </button>
        `

            const status = device.active ?
                '<span class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Actif</span>' :
                '<span class="bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">Inactif</span>';

            row.innerHTML = `
                <td class="px-4 py-2 text-xs border-b">${num}</td>
                <td class="px-4 py-2 font-semibold text-xs border-b">${device.name}</td>
                <td class="px-4 py-2 font-semibold text-xs border-b">${device.person ?? '-/-'}</td>
                <td class="px-4 py-2 font-semibold text-xs border-b">${status}</td>
                <td class="px-4 py-2 font-semibold text-xs border-b flex gap-1 items-center">
                ${action}
                ${showBtn}
                </td>
            `;

            tableBody.appendChild(row);
        })

    );

    $('#deviceTable').DataTable({
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

async function toogleDevice(device_id, action = 'enable') {

    startLoader();

    const data = {
        device_id,
        action
    };

    fetch(apiUrl.toogleDevice, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        method: 'POST',
    })
        .then(response => {

            if (response.ok) {

                // alert(`Terminal ${action == 'enable' ? 'activé' : 'déactivé'}`);
                fetchDevicesData();

            } else {
                alert("Une erreur ai survenue");
            }

        })
        .catch(error => {
            alert('Une erreur est survenue : ' + error.message);
        })
        .finally(() => {
            stopLoader();
        });

}

async function showDevice(device_id) {

    currentDevice = allDevice.filter(d => d.id == device_id)[0];
    console.log(currentDevice);

    document.getElementById('deviceId').value = currentDevice.id;
    document.getElementById('deviceName').value = currentDevice.name;
    if (currentDevice.person)
        document.getElementById('deviceUser').value = currentDevice.person;

    document.getElementById('modalDeviceInfo').classList.remove('hidden');

}

async function fetchQrcodeImage() {

    const loader = document.getElementById('loaderZoneQrCode');
    loader.classList.remove('hidden');
    try {
        const image = document.getElementById("areaQrCode");
        image.classList.add('hidden');


        const action = apiUrl.getAreaQrcode + activeZone.id
        const response = await fetch(action);

        if (response.ok) {

            const qrCodeBase64 = await response.json();
            image.classList.remove('hidden');
            image.src = qrCodeBase64;

        } else {
            alert("Failed to fetch QR code");
        }

    } catch (error) {
        alert("Failed to fetch QR code");
    } finally {
        loader.classList.add('hidden');
    }

}

function renderZones() {

    const zonesContainer = document.getElementById('zones-container');

    zonesContainer.innerHTML = '';

    allZone.forEach((zone, index) => {

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `px-4 py-2 text-xs border uppercase
            ${zone.id === activeZone.id ? 'text-white bg-gray-700 font-bold' : 'bg-white text-gray-900 border-gray-200'} 
            ${index === 0 ? 'rounded-s' : ''}
            ${index === allZone.length - 1 ? 'rounded-e' : ''}
            hover:bg-gray-700 hover:text-white hover:font-bold`;

        button.textContent = zone.label;

        button.addEventListener("click", () => {
            selectActiveZone(zone);
            renderZones();
        });

        zonesContainer.appendChild(button);

    });

}

function selectActiveZone(area) {
    activeZone = area;
    fetchDevicesData();
    fetchQrcodeImage();
}

// EVENT LISTENER

document.querySelector('#updateTerminalFrom').addEventListener('submit', function (event) {

    event.preventDefault();

    const formData = new FormData(this);

    const action = apiUrl.updateDevice;

    const data = Object.fromEntries(formData.entries());

    console.log(data);
    
    const loader = document.getElementById('updateDeviceLoader');
    loader.classList.remove('hidden');

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
            alert('Une erreur est survenue : ' + error.message);
        })
        .finally(() => {
            loader.classList.add('hidden');
            window.location.reload(true);
        });

});

document.querySelector('#removeDeviceBtn').addEventListener('click', function (event) {

    const loader = document.getElementById('removeDeviceLoader');
    loader.classList.remove('hidden');

    fetch(apiUrl.removeDevice + currentDevice.id, {
        headers: { 'Content-Type': 'application/json' },
        method: 'DELETE',
    })
        .then(response => {

            if (!response.ok)
                alert("Une erreur ai survenue");
        })
        .catch(error => {
            loader.classList.add('hidden');
            alert('Une erreur est survenue : ' + error.message);
        })
        .finally(() => {
            window.location.reload(true);
        });

});

document.addEventListener('DOMContentLoaded', () => {
    fetchAllZoneData();
});