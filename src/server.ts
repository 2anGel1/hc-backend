import app from "./app";

const PORT: number = parseInt(process.env.PORT || '8000');

app.listen((PORT), '0.0.0.0', () => {
  console.log(`Serveur en écoute sur http://0.0.0.0:${PORT}`);
});
