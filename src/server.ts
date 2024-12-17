import app from "./app";

const PORT: number = parseInt(process.env.PORT || '8000');

app.listen((PORT), '0.0.0.0', () => {
  console.log(`Serveur en local sur http://localhost:${PORT}`);
  console.log(`Serveur en production sur https://hc-backend-p26i.onrender.com`);
});
