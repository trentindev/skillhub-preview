import axios from "axios";
import { useEffect } from "react";

const BACK_URL = import.meta.env.VITE_BACK_URL || "http://localhost:3001";

function WorkshopList() {
  useEffect(() => {
    axios
      .get(`${BACK_URL}/api/workshops`)
      .then((response) => {
        console.log("Ateliers reçus :", response.data);
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la récupération des ateliers :",
          error.message,
        );
      });
  }, []);

  return (
    <div>
      <h2>Liste des ateliers</h2>
      <p>Consultez la console du navigateur pour voir les données reçues.</p>
    </div>
  );
}

export default WorkshopList;
