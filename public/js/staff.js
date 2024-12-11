const apiUrl = {
    deleteAllStaff: '/api/admin/staff/delete-all',
    uploadStaffExcel: '/api/admin/excel/staff',
    allStaff: '/api/admin/staff/get-all',
    addStaff: '/api/admin/staff/add',
};

document.querySelector('#uploadStaffForm').addEventListener('submit', function (event) {

    event.preventDefault();

    const loader = document.getElementById('uploadStaffLoader');

    loader.classList.remove('hidden');

    const formData = new FormData(this);
    const action = apiUrl.uploadStaffExcel;

    fetch(action, {
        method: 'POST',
        body: formData,
    })
        .then(response => {

            if (response.ok) {
                alert('Fichier importé avec succès !');
                window.location.reload(true);
            } else {
                alert('Erreur lors de l\'importation.');
            }

        })
        .catch(error => {
            loader.classList.add('hidden');
            alert('Une erreur est survenue : ' + error.message);
        })
        .finally(() => {
            loader.classList.add('hidden');
        });

});

document.querySelector('#confirmModalButton').addEventListener('click', function () {

    const confirmModal = document.getElementById("modal-dialog").classList.add('hidden');

    const loader = document.getElementById('emptyStaffLoader');

    loader.classList.remove('hidden');

    const action = apiUrl.deleteAllStaff;

    fetch(action, {
        method: 'DELETE',
    })
        .then(response => {

            if (response.ok) {
                alert('Liste vidée avec succès');
                window.location.reload(true);
            } else {
                alert('Erreur lors de la suppression.');
            }

        })
        .catch(error => {
            loader.classList.add('hidden');
            alert('Une erreur est survenue : ' + error.message);
        })
        .finally(() => {
            loader.classList.add('hidden');
        });

});

document.querySelector('#addStaffForm').addEventListener('submit', function (event) {

    event.preventDefault();

    const loader = document.getElementById('addStaffLoader');

    loader.classList.remove('hidden');

    const formData = new FormData(this);
    const action = apiUrl.addStaff;

    const data = Object.fromEntries(formData.entries());
    console.log('Données en objet:', data);

    fetch(action, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        method: 'POST',
    })
        .then(response => {

            if (response.ok) {
                alert("Membre ajouté avec succès !");
                window.location.reload(true);
            } else {
                alert("Erreur lors de l'ajout");
            }

        })
        .catch(error => {
            loader.classList.add('hidden');
            alert('Une erreur est survenue : ' + error.message);
        })
        .finally(() => {
            loader.classList.add('hidden');
        });

});

async function fetchStaffData() {

    const tableLoader = document.getElementById('loader-table');
    tableLoader.classList.remove('hidden');

    await fetch(apiUrl.allStaff)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const staffData = await response.json();

            // Générer le tableau
            populateTable(staffData);

        })
        .catch(error => {
            console.error(error.message);
            alert('Impossible de récupérer les données.');
        })
        .finally(() => {
            tableLoader.classList.add('hidden');
        });
}

function populateTable(staffList) {
    const tableBody = document.querySelector('#staffTable tbody');
    tableBody.innerHTML = ''; // Vide le tableau avant de le remplir

    var num = 0;
    staffList.forEach((staff) => {
        const row = document.createElement('tr');
        num += 1;
        row.innerHTML = `
            <td class="px-4 py-2 text-sm border-b">${num}</td>
            <td class="px-4 py-2 text-sm border-b">${staff.id}</td>
            <td class="px-4 py-2 text-sm border-b">${staff.names}</td>
            <td class="px-4 py-2 text-sm border-b">${staff.pole}</td>
            <td class="px-4 py-2 text-sm border-b">${staff.role}</td>
        `;
        tableBody.appendChild(row);
    });

    $('#staffTable').DataTable({
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

document.addEventListener('DOMContentLoaded', fetchStaffData);