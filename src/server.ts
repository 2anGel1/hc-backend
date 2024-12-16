import app from "./app";

const PORT: number = parseInt(process.env.PORT || '8000');

app.listen((PORT), '0.0.0.0', () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
  console.log(`Serveur en écoute sur http://localhost:${PORT}/event.html`);
});
