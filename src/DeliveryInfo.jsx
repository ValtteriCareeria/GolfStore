import React from "react";
import "./Pages.css";

const DeliveryInfo = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Toimitustiedot</h1>
      <p className="page-text">
        Toimitamme tuotteita nopeasti ja luotettavasti eri kuljetuspalveluiden avulla. 
        Voit valita itsellesi sopivimman toimitustavan kassalla. Alla näet 
        yleisimmät toimitustavat ja arvioidut toimitusajat.
      </p>

      <h2 className="page-subtitle">Toimitusvaihtoehdot</h2>
      <ul className="delivery-list">
  <li>
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Posti_Group.svg/2560px-Posti_Group.svg.png"
      alt="Posti"
      className="delivery-logo"
    />
    <span><strong>Posti:</strong> 1–3 arkipäivää, nouto postista tai pakettiautomaatista.</span>
  </li>
  <li>
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/d/d8/Small_Matkahuolto_logo_round_DarkBlue_RGB.jpg"
      alt="Matkahuolto"
      className="delivery-logo"
    />
    <span><strong>Matkahuolto:</strong> 1–4 arkipäivää, nouto Matkahuollon pisteestä.</span>
  </li>
  <li>
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/PostNord_wordmark.svg/2560px-PostNord_wordmark.svg.png"
      alt="PostNord"
      className="delivery-logo"
    />
    <span><strong>PostNord:</strong> 2–5 arkipäivää, toimitus kotiovelle tai automaattiin.</span>
  </li>
  <li>
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/DHL_Logo.svg/2560px-DHL_Logo.svg.png"
      alt="DHL"
      className="delivery-logo"
    />
    <span><strong>DHL Express:</strong> Nopea kansainvälinen toimitus, yleensä 1–2 arkipäivää.</span>
  </li>
  <li>
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/United_Parcel_Service_logo_2014.svg/78px-United_Parcel_Service_logo_2014.svg.png?20180816215442"
      alt="UPS"
      className="delivery-logo"
    />
    <span><strong>UPS:</strong> Luotettava kansainvälinen toimitus 2–4 arkipäivässä.</span>
  </li>
</ul>

      <h2 className="page-subtitle">Toimituskulut</h2>
      <p className="page-text">
        Toimituskulut määräytyvät valitun toimitustavan, tilauksen painon ja koon 
        perusteella. Kassalla näet lopulliset toimituskulut ennen tilauksen vahvistamista.
      </p>
    </div>
  );
};

export default DeliveryInfo;
