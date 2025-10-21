import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeliveryOptionService from "./services/DeliveryOptionService";
import "./DeliveryOptionList.css";

const DeliveryOptionList = ({ setMessage, setIsPositive, setShowMessage }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Tila vahvistusikkunaa varten. Tallentaa poistettavan kohteen tiedot ({ id, name }).
  const [optionToDelete, setOptionToDelete] = useState(null); 
  const navigate = useNavigate();

  // useEffect: Toimitustapojen haku palvelusta komponentin latautuessa
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Asetetaan todennus-token palvelulle.
        const token = localStorage.getItem("token");
        DeliveryOptionService.setToken(token);
        
        // Haetaan kaikki toimitustavat API:sta.
        const data = await DeliveryOptionService.getAll();
        setOptions(data);
        setLoading(false); // Lataus valmis
      } catch (err) {
        // Virheen käsittely, jos haku epäonnistuu.
        setError("Toimitustapojen lataaminen epäonnistui.");
        setLoading(false);
      }
    };
    fetchOptions();
  }, []); // Tyhjä riippuvuuslista varmistaa, että suoritetaan vain kerran.

  // Funktio, joka avaa poistovahvistusikkunan (korvaa window.confirmin).
  const confirmDelete = (id, name) => {
    // Tallennetaan poistettavan kohteen tiedot tilaan, joka renderöi modaalin.
    setOptionToDelete({ id, name }); 
  };
  
  // Varsinainen poistofunktio, joka suoritetaan käyttäjän vahvistuksen jälkeen.
  const executeDelete = async () => {
    if (!optionToDelete) return; // Estetään suoritus, jos tila on tyhjä.
    
    const { id, name } = optionToDelete;
    
    // Suljetaan modaali ja nollataan tila.
    setOptionToDelete(null); 

    try {
      // Kutsutaan palvelua poistamaan toimitustapa.
      await DeliveryOptionService.remove(id);
      
      // Päivitetään tila poistamalla poistettu kohde listalta.
      setOptions((prev) => prev.filter((o) => o.deliveryOptionId !== id));
      
      // Näytetään onnistumisviesti.
      setMessage(`Toimitustapa '${name}' poistettu onnistuneesti`);
      setIsPositive(true);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    } catch (err) {
      // Näytetään virheviesti poiston epäonnistuessa.
      setMessage("Poisto epäonnistui");
      setIsPositive(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 6000);
    }
  };

  // Käsittely lataus- ja virhetilanteille.
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
          onClick={() => navigate("/admin")}
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
          {/* Iteroidaan ja renderöidään toimitustavat */}
          {options.map((o) => (
            <tr key={o.deliveryOptionId}>
              <td>{o.name}</td>
              <td>{o.cost}</td>
              <td className="deliveryoptions-actions-cell">
                <button
                  className="deliveryoptions-btn-edit"
                  // Navigoidaan muokkaussivulle.
                  onClick={() =>
                    navigate(`/admin/deliveryoptions/edit/${o.deliveryOptionId}`)
                  }
                >
                  Edit
                </button>
                <button
                  className="deliveryoptions-btn-delete"
                  // Kutsutaan vahvistusfunktiota.
                  onClick={() => confirmDelete(o.deliveryOptionId, o.name)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {/* Näytetään viesti, jos listoja ei ole */}
          {options.length === 0 && (
            <tr>
              <td colSpan="3" className="deliveryoptions-empty">
                Ei toimitustapoja lisättynä.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Vahvistusikkuna (Modaali) */}
      {optionToDelete && (
        <div className="deliveryoptions-modal-overlay">
          <div className="deliveryoptions-modal">
            <p>Haluatko varmasti poistaa toimitustavan **{optionToDelete.name}**?</p>
            <div className="deliveryoptions-modal-actions">
              <button 
                // Peruuttaa poiston ja sulkee modaalin
                onClick={() => setOptionToDelete(null)} 
                className="deliveryoptions-btn-cancel"
              >
                Peruuta
              </button>
              <button 
                // Vahvistaa poiston kutsumalla executeDelete-funktiota
                onClick={executeDelete} 
                className="deliveryoptions-btn-delete-confirm"
              >
                Vahvista poisto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOptionList;
