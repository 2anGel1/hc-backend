var currentAllEvents = new Array();

// GET

// all satff
async function fetchAllEvents() {

    const loader = document.getElementById('allEventsLoader');
    loader.classList.remove('hidden');

    await fetch(apiUrl.getAllEvent)
        .then(async (response) => {

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des données.');
            }

            const eventData = await response.json();
            // console.log(eventData);

            currentAllEvents = eventData.map((staff) => staff);
            renderEvents();

        })
        .catch(error => {
            console.error(error.message);
            alert('Impossible de récupérer les données.');
        })
        .finally(() => {
            loader.classList.add('hidden');
        });

}

// OTHER

async function renderEvents() {

    const eventsContainer = document.getElementById('events-container');
    eventsContainer.innerHTML = '';

    await Promise.all(

        currentAllEvents.map((event) => {
            // Créer un conteneur pour chaque événement
            const container = document.createElement('div');
            container.className = "w-full h-[150px] border border-gray-200 rounded-lg shadow";
            container.style.backgroundImage = `url('${event.cover}')`;
            container.style.backgroundSize = "contain";

            // Ajouter l'overlay noir
            const overlay = document.createElement('div');
            overlay.className = "w-full h-[150px] rounded-lg bg-black opacity-75 p-6";

            // Ajouter le titre
            const title = document.createElement('h1');
            title.className = "text-xl text-white font-bold";
            title.textContent = event.label;

            // Ajouter la date
            const date = document.createElement('p');
            date.className = "text-xs text-white underline font-semibold";
            date.textContent = formatDate(event.date);

            // Ajouter les boutons
            const buttonContainer = document.createElement('div');
            buttonContainer.className = "w-full flex justify-between mt-6 opacity-100";

            const manageButton = document.createElement('button');
            manageButton.className = "inline-flex justify-center items-center rounded bg-gray-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600";
            manageButton.textContent = "Gérer l'événement";
            manageButton.addEventListener('click', () => {
                const jsonEvent = JSON.stringify(event);
                localStorage.setItem("ACTIVE_EVENT", jsonEvent);

                setTimeout(() => {
                    window.location.href = "/staff.html";
                }, 200);
            });

            const deleteButton = document.createElement('button');
            deleteButton.className = "inline-flex justify-center items-center rounded bg-red-800 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600";
            deleteButton.textContent = "Supprimer";
            deleteButton.addEventListener('click', () => {
                deleteEvent(event.id);
            });

            // Ajouter les boutons au conteneur
            buttonContainer.appendChild(manageButton);
            buttonContainer.appendChild(deleteButton);

            // Assembler tout
            overlay.appendChild(title);
            overlay.appendChild(date);
            overlay.appendChild(buttonContainer);
            container.appendChild(overlay);

            // Ajouter au DOM
            eventsContainer.appendChild(container);
        })

    );

    eventsContainer.classList.remove('hidden');
}

async function deleteEvent(id) {
    const action = apiUrl.removeEvent + id;

    startLoader();
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
}

// EVENT LISTENER

document.querySelector('#addEventForm').addEventListener('submit', function (event) {

    event.preventDefault();

    const loader = document.getElementById('addEventLoader');
    loader.classList.remove('hidden');

    const formData = new FormData(this);

    const action = apiUrl.addEvent;

    const data = Object.fromEntries(formData.entries());

    fetch(action, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        method: 'POST',
    })
        .then(response => {

            if (response.ok) {
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

document.querySelector('#logoutBtn').addEventListener('click', function (event) {

    startLoader();

    setTimeout(() => {
        stopLoader();
        window.location.href = "/login.html";
    }, 2000);

});

document.addEventListener('DOMContentLoaded', () => {
    fetchAllEvents();
});