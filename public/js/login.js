



// EVENT LISTENER

document.querySelector('#loginForm').addEventListener('submit', async function (event) {

    event.preventDefault();

    const formData = new FormData(this);

    const action = apiUrl.login;

    const data = Object.fromEntries(formData.entries());

    startLoader();
    fetch(action, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        method: 'POST',
    })
        .then(async (response) => {

            if (response.ok) {

                const data = await response.json();
                const userJson = JSON.stringify(data.user);

                localStorage.setItem("AUTH_USER", userJson);
                setTimeout(() => {
                    window.location.href = "/event.html";
                }, 500);
            } else {
                alert("Nom d'utilisateur ou mot de passe incorrect");
            }

        })
        .catch(error => {
            alert('Une erreur est survenue : ' + error.message);
        })
        .finally(() => {
            stopLoader();
        });

});