const API_URL = "https://hc-backend-p26i.onrender.com"
// const API_URL = "http://localhost:8000"

apiUrl = {

    // auth
    login: "/api/admin/auth/login",

    // event
    getAllEvent: "/api/admin/event/get-all",
    removeEvent: "/api/admin/event/delete/",
    addEvent: "/api/admin/event/add",

    // staff
    deleteAllStaff: '/api/admin/staff/delete-all/',
    downloadStaffQrcode: '/api/qr/generate-one/',
    uploadStaffExcel: '/api/admin/excel/staff/',
    donwloadListe: '/api/qr/download-all-csv/',
    removeStaff: '/api/admin/staff/delete/',
    allStaff: '/api/admin/staff/get-all/',
    getStaffQrcode: '/api/qr/get-one/',
    addStaff: '/api/admin/staff/add',

    // zone
    associateStaffToArea: '/api/admin/area/associate',
    allZoneStaff: '/api/admin/area/get-staff/',
    removeAera: '/api/admin/area/delete/',
    allZone: '/api/admin/area/get-all/',
    addAera: '/api/admin/area/add',

    // terminal
    removeDevice: '/api/admin/device/delete/',
    toogleDevice: '/api/admin/device/toogle',
    allDevice: '/api/admin/area/get-device/',
    getAreaQrcode: '/api/qr/area/get-one/',

    // history
    getAllHistory: "/api/admin/checkings/get-all/",

}

activeEvent = null;
authUser = null;

formatDate = function (isoDate) {
    const date = new Date(isoDate);

    const options = { day: "2-digit", month: "long", year: "numeric" };
    const formattedDate = new Intl.DateTimeFormat("fr-FR", options).format(date);

    return formattedDate;
}

formatHour = function (isoDate) {
    const date = new Date(isoDate);

    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const formattedTime = `${hours}h${minutes}`;

    return formattedTime;
}

startLoader = function () {
    loading();
}

stopLoader = function () {
    loading(false);
}

function loading(load = true) {

    const loader = document.getElementById('loaderModal');
    if (load) {
        loader.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
    }

}

function init() {

    const currentUrl = window.location.href.split("/");
    const currentPage = currentUrl[currentUrl.length - 1];

    if (currentPage !== "login.html") {

        const authUserJson = localStorage.getItem("AUTH_USER");
        if (authUserJson) {

            authUser = JSON.parse(authUserJson);

            if (authUser) {

                if (currentPage != "event.html") {

                    const activeEventJson = localStorage.getItem("ACTIVE_EVENT");

                    if (activeEventJson) {

                        activeEvent = JSON.parse(activeEventJson);

                        if (activeEvent) {

                            const header = document.querySelector("header");
                            header.className = "bg-white shadow";

                            // Créer le div contenant l'image d'arrière-plan
                            const backgroundDiv = document.createElement("div");
                            backgroundDiv.className = "w-full h-[80px]";
                            backgroundDiv.style.backgroundImage = `url('${activeEvent.cover}')`;
                            backgroundDiv.style.backgroundSize = "contain";

                            // Créer le div pour le contenu noir
                            const blackOverlay = document.createElement("div");
                            blackOverlay.className = "w-full h-[80px] bg-black opacity-65 p-4";

                            // Ajouter le titre
                            const title = document.createElement("h1");
                            title.className = "text-xl text-white font-bold";
                            title.textContent = activeEvent.label;

                            // Ajouter le sous-titre
                            const subtitle = document.createElement("p");
                            subtitle.className = "text-xs text-white underline font-semibold";
                            subtitle.textContent = formatDate(activeEvent.date);

                            // Ajouter les éléments dans leur conteneur respectif
                            blackOverlay.appendChild(title);
                            blackOverlay.appendChild(subtitle);
                            backgroundDiv.appendChild(blackOverlay);
                            header.appendChild(backgroundDiv);

                            // Ajouter le header au body ou à un autre conteneur
                            // document.body.appendChild(header);
                        } else {
                            window.location.href = "/event.html";
                        }

                    } else {
                        window.location.href = "/event.html";
                    }
                } else {
                    localStorage.removeItem("ACTIVE_EVENT");
                }

            } else {
                window.location.href = "/login.html";
            }

        } else {
            window.location.href = "/login.html";
        }

    } else {
        localStorage.clear();
    }


}

init();