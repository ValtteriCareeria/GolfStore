import React, { useEffect, useState } from 'react';
import ModelService from './services/ModelService';
import BrandService from './services/BrandService';
import { useNavigate } from "react-router-dom";
import './ModelManagement.css';

const ModelManagement = () => {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [newModelName, setNewModelName] = useState('');
  const [brandId, setBrandId] = useState('');
  const [error, setError] = useState(''); // Tila virheilmoituksille
  const [modelToDelete, setModelToDelete] = useState(null); // Tila poistovahvistusta varten
  const navigate = useNavigate();

  // Asetetaan todennus-token ModelServicelle
  const token = localStorage.getItem('token');
  ModelService.setToken(token);

  // useEffect: Haetaan mallit ja brändit palveluista komponentin latautuessa
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Haetaan mallit ja brändit
        const modelData = await ModelService.getAll();
        const brandData = await BrandService.getAll();
        setModels(modelData);
        setBrands(brandData);
      } catch (err) {
        // Virheiden käsittely haun epäonnistuessa
        console.error("Virhe mallien tai brändien haussa:", err);
        setError("Tietojen lataus epäonnistui.");
      }
    };
    fetchData();
  }, []); // Suoritetaan vain kerran latauksessa

  // Käsittelijä uuden mallin lisäämiselle
  const handleAdd = async () => {
    // Tarkistetaan syötteiden olemassaolo
    if (!newModelName || !brandId) {
      // Näytetään virheviesti alert() sijaan
      setError("Täytä nimi ja valitse brändi.");
      return;
    }
    setError(''); // Tyhjennetään aiempi virhe

    try {
      const newModel = {
        Name: newModelName,
        BrandID: parseInt(brandId) // Varmistetaan, että BrandID on kokonaisluku
      };
      // Luodaan uusi malli palvelun kautta
      const created = await ModelService.create(newModel);
      // Päivitetään mallilista ja tyhjennetään lomake
      setModels([...models, created]);
      setNewModelName('');
      setBrandId('');
    } catch (err) {
      console.error("Mallin lisäys epäonnistui:", err);
      setError("Mallin lisäys epäonnistui. Tarkista konsoli.");
    }
  };

  // Funktio, joka käynnistää poistovahvistuksen
  const confirmDelete = (id) => {
    // Asetetaan poistettavan mallin ID tilaan, joka näyttää vahvistusikkunan
    setModelToDelete(id);
  };

  // Varsinainen poistofunktio, joka suoritetaan vahvistuksen jälkeen
  const executeDelete = async () => {
    if (!modelToDelete) return; // Varmistetaan, että poistettava malli on valittu

    try {
      // Kutsutaan palvelua poistamaan malli
      await ModelService.remove(modelToDelete);
      // Päivitetään tila poistamalla malli listalta
      setModels(models.filter(m => m.modelID !== modelToDelete));
      setError('');
    } catch (err) {
      console.error("Mallin poisto epäonnistui:", err);
      setError("Mallin poisto epäonnistui. Tarkista konsoli.");
    } finally {
      // Suljetaan vahvistusikkuna
      setModelToDelete(null);
    }
  };

  // Etsitään poistettavan mallin nimi vahvistusikkunaa varten
  const modelNameForConfirmation = models.find(m => m.modelID === modelToDelete)?.name || 'tämä malli';

  // Komponentin renderöinti
  return (
    <div className="modelmanagement-container">
      <h2 className="modelmanagement-title">Model Management</h2>

      {/* Virheilmoituksen näyttäminen */}
      {error && (
        <div className="modelmanagement-error">
          {error}
        </div>
      )}

      {/* Lomake uuden mallin lisäämiseksi */}
      <div className="modelmanagement-form">
        <input
          type="text"
          placeholder="Uusi malli"
          value={newModelName}
          onChange={e => setNewModelName(e.target.value)}
          className="modelmanagement-input"
        />
        <select
          value={brandId}
          onChange={e => setBrandId(e.target.value)}
          className="modelmanagement-select"
        >
          <option value="">Valitse brändi</option>
          {/* Renderöidään brändivaihtoehdot */}
          {brands.map(b => (
            <option key={b.brandID} value={b.brandID}>{b.name}</option>
          ))}
        </select>
        <button onClick={handleAdd} className="modelmanagement-btn">Lisää malli</button>
        <button className="modelmanagement-btn-back" onClick={() => navigate(-1)}>Takaisin</button>
      </div>

      {/* Mallien listaus */}
      <div className="modelmanagement-list">
        {models.length === 0 && <p className="modelmanagement-empty">Ei vielä malleja.</p>}
        {/* Iteroidaan ja renderöidään mallit */}
        {models.map(m => (
          <div key={m.modelID} className="modelmanagement-item">
            {/* Mallin nimi ja brändin nimi */}
            <span>{m.name} ({m.brand?.name})</span>
            {/* Poistonapin klikkaus avaa vahvistusikkunan */}
            <button onClick={() => confirmDelete(m.modelID)} className="modelmanagement-btn-delete">
              Poista
            </button>
          </div>
        ))}
      </div>

      {/* Vahvistusikkuna (Korvaa window.confirmin) */}
      {modelToDelete && (
        <div className="modelmanagement-modal-overlay">
          <div className="modelmanagement-modal">
            <p>Haluatko varmasti poistaa mallin **{modelNameForConfirmation}**?</p>
            <div className="modelmanagement-modal-actions">
              <button onClick={() => setModelToDelete(null)} className="modelmanagement-btn-cancel">
                Peruuta
              </button>
              <button onClick={executeDelete} className="modelmanagement-btn-delete">
                Vahvista poisto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelManagement;
