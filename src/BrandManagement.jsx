import React, { useState, useEffect } from "react";
import BrandService from "./services/BrandService";
import "./BrandManagement.css";
import { useNavigate } from "react-router-dom";

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  BrandService.setToken(token);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await BrandService.getAll();
        setBrands(data);
      } catch (err) {
        console.error("Virhe haettaessa brandejä:", err);
      }
    };
    fetchBrands();
  }, []);

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    try {
      const added = await BrandService.add({ name: newBrandName });
      setBrands([added, ...brands]);
      setNewBrandName("");
    } catch (err) {
      console.error("Brandin lisäys epäonnistui:", err);
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm("Haluatko varmasti poistaa tämän brandin?")) return;
    try {
      await BrandService.remove(id);
      setBrands(brands.filter((b) => b.brandID !== id));
    } catch (err) {
      console.error("Brandin poisto epäonnistui:", err);
    }
  };

  return (
    <div className="brandmanagement-container">
      <h2 className="brandmanagement-title">Brandien hallinta</h2>

      <div className="brandmanagement-form">
        <input
          type="text"
          className="brandmanagement-input"
          placeholder="Uusi merkki"
          value={newBrandName}
          onChange={(e) => setNewBrandName(e.target.value)}
        />
        <button className="brandmanagement-btn" onClick={handleAddBrand}>
          Lisää
        </button>
        <button
          className="brandmanagement-btn-back"
          onClick={() => navigate(-1)}
        >
          Takaisin
        </button>
      </div>

      <div className="brandmanagement-list">
        {brands.length === 0 && (
          <p className="brandmanagement-empty">Ei brandejä lisättynä.</p>
        )}
        {brands.map((b) => (
          <div key={b.brandID} className="brandmanagement-item">
            <span>{b.name}</span>
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
