import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeliveryOptionService from "./services/DeliveryOptionService";
import "./DeliveryOptionList.css";

const DeliveryOptionList = ({ setMessage, setIsPositive, setShowMessage }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = localStorage.getItem("token");
        DeliveryOptionService.setToken(token);
        const data = await DeliveryOptionService.getAll();
        setOptions(data);
        setLoading(false);
      } catch (err) {
        setError("Toimitustapojen lataaminen epäonnistui.");
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Haluatko poistaa toimitustavan ${name}?`)) return;
    try {
      await DeliveryOptionService.remove(id);
      setOptions((prev) => prev.filter((o) => o.deliveryOptionId !== id));
      setMessage(`Toimitustapa '${name}' poistettu onnistuneesti`);
      setIsPositive(true);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    } catch (err) {
      setMessage("Poisto epäonnistui");
      setIsPositive(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 6000);
    }
  };

  if (loading) return <p className="deliveryoptions-loading">Ladataan...</p>;
  if (error) return <p className="deliveryoptions-error">{error}</p>;

  return (
    <div className="deliveryoptions-container">
      <h2 className="deliveryoptions-title">Delivery Options</h2>

      <div className="deliveryoptions-actions">
        <button
          onClick={() => navigate("/admin/deliveryoptions/add")}
          className="deliveryoptions-btn"
        >
          Add New
        </button>
        <button
          className="deliveryoptions-btn-back"
          onClick={() => navigate(-1)}
        >
          Takaisin
        </button>
      </div>

      <table className="deliveryoptions-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Cost (€)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {options.map((o) => (
            <tr key={o.deliveryOptionId}>
              <td>{o.name}</td>
              <td>{o.cost}</td>
              <td className="deliveryoptions-actions-cell">
                <button
                  className="deliveryoptions-btn-edit"
                  onClick={() =>
                    navigate(`/admin/deliveryoptions/edit/${o.deliveryOptionId}`)
                  }
                >
                  Edit
                </button>
                <button
                  className="deliveryoptions-btn-delete"
                  onClick={() => handleDelete(o.deliveryOptionId, o.name)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {options.length === 0 && (
            <tr>
              <td colSpan="3" className="deliveryoptions-empty">
                Ei toimitustapoja lisättynä.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveryOptionList;
