import React from "react";
import "./Pages.css";

const Privacy = () => {
  return (
    <div className="page-container">
      <h2 className="page-title">Tietosuojaseloste</h2>
      <p className="page-text">
        Verkkokauppamme kunnioittaa asiakkaiden yksityisyyttä ja suojaa
        henkilötietoja voimassa olevan tietosuojalainsäädännön mukaisesti.
      </p>

      <h3 className="page-subtitle">Kerättävät tiedot</h3>
      <ul className="page-list">
        <li>Nimi ja yhteystiedot (osoite, sähköposti, puhelinnumero)</li>
        <li>Kirjautumistiedot ja käyttäjätilin tiedot</li>
        <li>Tilaus- ja maksutiedot</li>
      </ul>

      <h3 className="page-subtitle">Tietojen käyttö</h3>
      <p className="page-text">
        Tietoja käytetään tilausten käsittelyyn, asiakaspalveluun sekä
        markkinointiin, jos olet antanut siihen suostumuksesi.
      </p>

      <h3 className="page-subtitle">Tietojen suojaus</h3>
      <p className="page-text">
        Käytämme SSL-salausta ja turvallisia palvelimia. Henkilötietoihin on
        pääsy vain niillä työntekijöillä, joiden on välttämätöntä käsitellä
        tietoja.
      </p>
    </div>
  );
};

export default Privacy;
