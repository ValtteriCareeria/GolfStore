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
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  ModelService.setToken(token);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modelData = await ModelService.getAll();
        const brandData = await BrandService.getAll();
        setModels(modelData);
        setBrands(brandData);
      } catch (err) {
        console.error("Virhe mallien tai brändien haussa:", err);
      }
    };
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!newModelName || !brandId) return alert("Täytä nimi ja valitse brändi.");

    try {
      const newModel = {
        Name: newModelName,
        BrandID: parseInt(brandId)
      };
      const created = await ModelService.create(newModel);
      setModels([...models, created]);
      setNewModelName('');
      setBrandId('');
    } catch (err) {
      console.error("Mallin lisäys epäonnistui:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Haluatko varmasti poistaa tämän mallin?")) {
      try {
        await ModelService.remove(id);
        setModels(models.filter(m => m.modelID !== id));
      } catch (err) {
        console.error("Mallin poisto epäonnistui:", err);
      }
    }
  };

  return (
    <div className="modelmanagement-container">
      <h2 className="modelmanagement-title">Model Management</h2>

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
          {brands.map(b => (
            <option key={b.brandID} value={b.brandID}>{b.name}</option>
          ))}
        </select>
        <button onClick={handleAdd} className="modelmanagement-btn">Lisää malli</button>
        <button className="modelmanagement-btn-back" onClick={() => navigate(-1)}>Takaisin</button>
      </div>

      <div className="modelmanagement-list">
        {models.length === 0 && <p className="modelmanagement-empty">Ei vielä malleja.</p>}
        {models.map(m => (
          <div key={m.modelID} className="modelmanagement-item">
            <span>{m.name} ({m.brand?.name})</span>
            <button onClick={() => handleDelete(m.modelID)} className="modelmanagement-btn-delete">
              Poista
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelManagement;
