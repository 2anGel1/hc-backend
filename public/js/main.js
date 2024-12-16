const activeEvent = JSON.parse(localStorage.getItem("ACTIVE_EVENT"));

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
}

function formatDate(isoDate) {
    // Convertir en objet Date
    const date = new Date(isoDate);

    // Formater avec Intl.DateTimeFormat
    const options = { day: "2-digit", month: "long", year: "numeric" };
    const formattedDate = new Intl.DateTimeFormat("fr-FR", options).format(date);

    return formattedDate;
}