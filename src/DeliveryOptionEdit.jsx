import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DeliveryOptionService from "./services/DeliveryOptionService";
import "./DeliveryOptionList.css"; // sama tyylitiedosto

const DeliveryOptionEdit = ({ setMessage, setIsPositive, setShowMessage }) => {
  const { id } = useParams();
  const [option, setOption] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOption = async () => {
      try {
        const token = localStorage.getItem("token");
        DeliveryOptionService.setToken(token);
        const data = await DeliveryOptionService.getById(id);
        setOption(data);
      } catch (err) {
        setMessage("Toimitustavan haku epäonnistui");
        setIsPositive(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 6000);
      }
    };
    fetchOption();
  }, [id]);

  const handleSave = async () => {
    if (!option.name || !option.cost) return;
    try {
      await DeliveryOptionService.update(option);
      setMessage(`Toimitustapa '${option.name}' päivitetty onnistuneesti`);
      setIsPositive(true);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
      navigate("/admin/deliveryoptions");
    } catch (err) {
      setMessage("Päivitys epäonnistui");
      setIsPositive(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 6000);
    }
  };

  if (!option) return <p className="deliveryoptions-loading">Ladataan...</p>;

  return (
    <div className="deliveryoptions-container">
      <h2 className="deliveryoptions-title">Muokkaa toimitustapaa</h2>

      <div className="deliveryoptions-actions">
        <input
          type="text"
          value={option.name}
          onChange={(e) => setOption({ ...option, name: e.target.value })}
          className="deliveryoptions-input"
          placeholder="Nimi"
        />
        <input
          type="number"
          value={option.cost}
          onChange={(e) => setOption({ ...option, cost: e.target.value })}
          className="deliveryoptions-input"
          placeholder="Hinta"
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

export default DeliveryOptionEdit;
