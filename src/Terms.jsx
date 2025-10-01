import React from "react";
import "./Pages.css";

const Terms = () => {
  return (
    <div className="page-container">
      <h2 className="page-title">Käyttöehdot</h2>

      <h3 className="page-subtitle">Yleistä</h3>
      <p className="page-text">
        Näitä käyttöehtoja sovelletaan verkkokauppamme käyttöön ja tilausten
        tekemiseen.
      </p>

      <h3 className="page-subtitle">Tilaaminen</h3>
      <p className="page-text">
        Kaikki tilaukset vahvistetaan sähköpostitse. Tilauksen tekeminen
        edellyttää täysi-ikäisyyttä.
      </p>

      <h3 className="page-subtitle">Toimitus</h3>
      <p className="page-text">
        Toimitamme tilaukset normaalisti 2–5 arkipäivässä. Toimituskulut
        näkyvät kassalla ennen maksua.
      </p>

      <h3 className="page-subtitle">Palautukset</h3>
      <p className="page-text">
        Sinulla on 14 päivän palautusoikeus käyttämättömille tuotteille.
      </p>
    </div>
  );
};

export default Terms;
