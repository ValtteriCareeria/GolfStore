import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">

      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">Tervetuloa GolfStoreen ⛳</h1>
        <p className="hero-subtitle">
          Osta, myy ja selaa golfmailoja sekä varusteita helposti.
        </p>
        <button className="hero-btn" onClick={() => navigate("/products")}>
          Selaa tuotteita
        </button>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <div className="info-card">
          <h3>🏌️ Myy tuotteesi</h3>
          <p>
            Luo käyttäjätili ja lisää myyntiin golfmailoja ja tarvikkeita nopeasti.
          </p>
        </div>
        <div className="info-card">
          <h3>🛒 Osta helposti</h3>
          <p>
            Selaa muiden käyttäjien ilmoituksia ja löydä parhaat välineet omaan peliisi.
          </p>
        </div>
        <div className="info-card">
          <h3>⭐ Luotettavaa kauppaa</h3>
          <p>
            Yhteystiedot ja profiilit varmistavat turvallisen ja läpinäkyvän kaupankäynnin.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <h2>Löydä parhaat golfvarusteet jo tänään!</h2>
        <p>Kirjaudu sisään tai rekisteröidy ja liity golfyhteisöömme.</p>
        <div className="cta-buttons">
          <button className="myproducts-btn btn-primary" onClick={() => navigate("/register")}>
            Rekisteröidy
          </button>
          <button className="myproducts-btn btn-secondary" onClick={() => navigate("/login")}>
            Kirjaudu
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
