import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeliveryOptionService from "./services/DeliveryOptionService";
import "./DeliveryOptionList.css"; // sama CSS-tiedosto kuin listalla

const DeliveryOptionAdd = ({ setMessage, setIsPositive, setShowMessage }) => {
  const [option, setOption] = useState({ name: "", cost: "" });
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!option.name || !option.cost) return;
    try {
      const token = localStorage.getItem("token");
      DeliveryOptionService.setToken(token);
      await DeliveryOptionService.create({
        name: option.name,
        cost: parseFloat(option.cost),
      });
      setMessage(`Lisättiin uusi toimitustapa: ${option.name}`);
      setIsPositive(true);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
      navigate("/admin/deliveryoptions");
    } catch (err) {
      setMessage("Lisäys epäonnistui");
      setIsPositive(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 6000);
    }
  };

  return (
    <div className="deliveryoptions-container">
      <h2 className="deliveryoptions-title">Lisää toimitustapa</h2>

      <div className="deliveryoptions-actions">
        <input
          type="text"
          placeholder="Nimi"
          value={option.name}
          onChange={(e) => setOption({ ...option, name: e.target.value })}
          className="deliveryoptions-input"
        />
        <input
          type="number"
          placeholder="Hinta"
          value={option.cost}
          onChange={(e) => setOption({ ...option, cost: e.target.value })}
          className="deliveryoptions-input"
        />
      </div>

      <div className="deliveryoptions-actions">
        <button onClick={handleSave} className="deliveryoptions-btn">
          Tallenna
        </button>
        <button
          onClick={() => navigate("/admin/deliveryoptions")}
          className="deliveryoptions-btn-back"
        >
          Peruuta
        </button>
      </div>
    </div>
  );
};

export default DeliveryOptionAdd;
