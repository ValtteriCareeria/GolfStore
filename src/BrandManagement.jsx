import React, { useState, useEffect } from "react";
import BrandService from "./services/BrandService";
import "./BrandManagement.css";
import { useNavigate } from "react-router-dom";

// BrandManagement-komponentti hallinnoi tuotemerkkien (brändien) listaa.
const BrandManagement = () => {
  // Tilat brändien listalle ja uuden brändin syötekentälle
  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState("");
  
  const navigate = useNavigate();

  // Asetetaan todennus-token BrandService-palvelulle ennen muita toimintoja
  const token = localStorage.getItem("token");
  BrandService.setToken(token);

  // useEffect: Hakee kaikki brändit kerran, kun komponentti latautuu
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await BrandService.getAll();
        // Asetetaan haetut brändit tilaan
        setBrands(data);
      } catch (err) {
        console.error("Virhe haettaessa brandejä:", err);
      }
    };
    fetchBrands();
  }, []); // Tyhjä taulukko varmistaa, että suoritetaan vain kerran latauksen yhteydessä

  // handleAddBrand: Lisää uuden brändin
  const handleAddBrand = async () => {
    // Estetään lisäys, jos nimi on tyhjä
    if (!newBrandName.trim()) return;
    try {
      const added = await BrandService.add({ name: newBrandName });
      // Lisätään uusi brändi olemassa olevan listan alkuun ja päivitetään tila
      setBrands([added, ...brands]);
      // Tyhjennetään syötekenttä
      setNewBrandName("");
    } catch (err) {
      console.error("Brandin lisäys epäonnistui:", err);
    }
  };

  // handleDeleteBrand: Poistaa brändin ID:n perusteella
  const handleDeleteBrand = async (id) => {
    // HUOM: window.confirm() on vanha tapa ja tulisi korvata kustomoidulla modaali-ikkunalla.
    if (!window.confirm("Haluatko varmasti poistaa tämän brandin?")) return;
    try {
      await BrandService.remove(id);
      // Suodatetaan poistettu brändi pois listalta ja päivitetään tila
      setBrands(brands.filter((b) => b.brandID !== id));
    } catch (err) {
      console.error("Brandin poisto epäonnistui:", err);
    }
  };

  return (
    <div className="brandmanagement-container">
      <h2 className="brandmanagement-title">Brandien hallinta</h2>

      <div className="brandmanagement-form">
        {/* Syötekenttä uudelle brändille. Tilan käsittely onChange-tapahtumassa. */}
        <input
          type="text"
          className="brandmanagement-input"
          placeholder="Uusi merkki"
          value={newBrandName}
          onChange={(e) => setNewBrandName(e.target.value)}
        />
        {/* Lisäysnappi, joka kutsuu handleAddBrand-funktiota */}
        <button className="brandmanagement-btn" onClick={handleAddBrand}>
          Lisää
        </button>
        {/* Takaisin-nappi, joka käyttää useNavigate-hookia */}
        <button
          className="brandmanagement-btn-back"
          onClick={() => navigate(-1)}
        >
          Takaisin
        </button>
      </div>

      <div className="brandmanagement-list">
        {/* Näytetään viesti, jos brändejä ei ole */}
        {brands.length === 0 && (
          <p className="brandmanagement-empty">Ei brandejä lisättynä.</p>
        )}
        {/* Iteroidaan olemassa olevat brändit ja näytetään ne */}
        {brands.map((b) => (
          <div key={b.brandID} className="brandmanagement-item">
            <span>{b.name}</span>
            {/* Poistonappi, joka kutsuu handleDeleteBrand-funktiota brändin ID:llä */}
            <button
              className="brandmanagement-btn-delete"
              onClick={() => handleDeleteBrand(b.brandID)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandManagement;
