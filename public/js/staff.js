var currentAllStaff = new Array();
var allStaff = new Array();
var currentStaff = {};

// FETCH

async function fetchStaffData() {

    const tableLoader = document.getElementById('loader-table');
    tableLoader.classList.remove('hidden');

    const table = document.querySelector('#staffTable');
    table.classList.add('hidden');
    
    await fetch(apiUrl.allStaff + activeEvent.id)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const staffData = await response.json();

            currentAllStaff = staffData.map(el => el);
            allStaff = staffData.map(el => el);
            populateTable(allStaff);

        })
        .catch(error => {
            console.error(error.message);
            alert('Impossible de récupérer les données.');
        })
        .finally(() => {
            tableLoader.classList.add('hidden');
            table.classList.remove('hidden');
        });
}

// POPULATE

async function populateTable(liste) {

    if ($.fn.DataTable.isDataTable('#staffTable')) {
        $('#staffTable').DataTable().destroy();
        $('#staffTable').empty();
        $('#staffTable').append(`
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-2 text-sm border-b border-r">#</th>
                        <th class="px-4 py-2 text-sm border-b">Qrcode ID</th>
                        <th class="px-4 py-2 text-sm border-b">Nom et Prénoms</th>
                        <th class="px-4 py-2 text-sm border-b">Pôle</th>
                        <th class="px-4 py-2 text-sm border-b">Fonction</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            `);
    }

    const tableBody = document.querySelector('#staffTable tbody');
    tableBody.innerHTML = '';


    var num = 0;
    await Promise.all(

        liste.map(async (staff) => {
            const row = document.createElement('tr');
            row.className = `hover:bg-gray-100 cursor-pointer`;
            row.addEventListener('click', async () => {
                currentStaff = staff;

                const imageSource = await getStaffImage();

                document.getElementById("modalStaffImage").src = imageSource;
                document.getElementById('modalStaffInfo').classList.remove('hidden');

                document.getElementById('modalStaffNames').textContent = staff.names.toUpperCase();
                document.getElementById('modalStaffId').textContent = staff.id;
                if (document.getElementById('modalStaffPole'))
                    document.getElementById('modalStaffPole').textContent = staff.pole;

                if (document.getElementById('modalStaffRole'))
                    document.getElementById('modalStaffRole').textContent = staff.role;
            });

            num += 1;
            row.innerHTML = `
                <td class="px-4 py-2 text-sm text-center border-b border-r">${num}</td>
                <td class="px-4 py-2 text-sm border-b">${staff.id}</td>
                <td class="px-4 py-2 text-sm border-b">${staff.names}</td>
                <td class="px-4 py-2 text-sm border-b">${staff.pole}</td>
                <td class="px-4 py-2 text-sm border-b">${staff.role}</td>
            `;
            tableBody.appendChild(row);
        })
    );

    $('#staffTable').DataTable({
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

async function getStaffImage() {

    try {
        const action = apiUrl.getStaffQrcode + currentStaff.id
        const response = await fetch(action);

        if (response.ok) {

            const qrCodeBase64 = await response.json();
            return qrCodeBase64;

        } else {
            throw new Error("Failed to fetch QR code");
            // return ""
        }

    } catch (error) {
        console.error("Error downloading QR code:", error);
        return "";
    }

}

// EVENT LISTENER

document.addEventListener('DOMContentLoaded', fetchStaffData);

document.querySelector('#donwloadSatffQrButton').addEventListener('click', async function () {

    try {
        const action = apiUrl.downloadStaffQrcode + currentStaff.id
        const response = await fetch(action);

        if (!response.ok) {
            throw new Error("Failed to fetch QR code");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${currentStaff.names}_${currentStaff.pole}_${currentStaff.role}_${currentStaff.id}_qrcode.png`;
        link.click();

        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading QR code:", error);
    }

});

document.querySelector('#donwloadStaffQrcodesButton').addEventListener('click', async function () {

    const url = "/api/qr/generate-all/" + activeEvent.id;
    window.open(url, "_blank");

});

document.querySelector('#donwloadSaffListeButton').addEventListener('click', async function () {

    const url = apiUrl.donwloadListe + activeEvent.id;
    window.open(url, "_blank");

});

document.querySelector('#uploadStaffForm').addEventListener('submit', function (event) {

    event.preventDefault();

    
    const formData = new FormData(this);
    const action = apiUrl.uploadStaffExcel + activeEvent.id;
    
    startLoader();
    fetch(action, {
        method: 'POST',
        body: formData,
    })
        .then(response => {

            if (response.ok) {
                alert('Fichier importé avec succès !');
                // window.location.reload(true);
                fetchStaffData();
            } else {
                alert('Erreur lors de l\'importation.');
            }

        })
        .catch(error => {
            alert('Une erreur est survenue : ' + error.message);
        })
        .finally(() => {
            stopLoader();
        });

});

document.querySelector('#confirmModalButton').addEventListener('click', function () {

    document.getElementById("emptyListeModal").classList.add('hidden');

    const action = apiUrl.deleteAllStaff + activeEvent.id;

    startLoader();
    fetch(action, {
        method: 'DELETE',
    })
        .then(response => {

            if (response.ok) {
                alert('Liste vidée avec succès');
                fetchStaffData();
            } else {
                alert('Erreur lors de la suppression.');
            }

        })
        .catch(error => {
            alert('Une erreur est survenue : ' + error.message);
        })
        .finally(() => {
            stopLoader();
        });

});

document.querySelector('#addStaffForm').addEventListener('submit', function (event) {

    event.preventDefault();

    
    const formData = new FormData(this);
    formData.append("event_id", activeEvent.id);
    
    const action = apiUrl.addStaff;
    
    const data = Object.fromEntries(formData.entries());
    
    startLoader();
    fetch(action, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        method: 'POST',
    })
        .then(response => {

            if (response.ok) {
                alert("Membre ajouté avec succès !");
                fetchStaffData();
            } else {
                alert("Erreur lors de l'ajout");
            }

        })
        .catch(error => {
            alert('Une erreur est survenue : ' + error.message);
        })
        .finally(() => {
            stopLoader();
        });

});

document.querySelector('#staffSearch').addEventListener('input', (e) => {

    const searchParam = e.target.value.toLowerCase();

    const newListe = allStaff.filter((staff) => {
        return (
            staff.names.toLowerCase().includes(searchParam) ||
            staff.pole.toLowerCase().includes(searchParam) ||
            staff.id.toLowerCase().includes(searchParam) ||
            staff.role.toLowerCase().includes(searchParam)
        )
    });

    currentAllStaff = newListe.map(el => el);
    populateTable(newListe);

});

document.querySelector('#removeStaffButton').addEventListener('click', function (event) {

    event.preventDefault();

    const loader = document.getElementById('removeStaffLoader');
    loader.classList.remove('hidden');

    const action = apiUrl.removeStaff + currentStaff.id;

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