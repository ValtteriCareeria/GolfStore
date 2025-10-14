import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentMethodService from './services/PaymentMethod';
import './PaymentMethodList.css';

// Komponentti maksutapojen hallintaan (vain pääkäyttäjille)
const PaymentMethodList = ({ setMessage, setIsPositive, setShowMessage }) => {
  // Tila maksutapojen listalle
  const [methods, setMethods] = useState([]);
  // Tila uudelle lisättävälle maksutavalle
  const [newMethodName, setNewMethodName] = useState('');
  // Tila uudelleenlatauksen käynnistämiseksi (esim. lisäyksen tai poiston jälkeen)
  const [reload, setReload] = useState(false);

  // Hook navigointiin (sivujen välillä siirtymiseen)
  const navigate = useNavigate();
  // Tarkistetaan, onko käyttäjä pääkäyttäjä (Admin)
  const isAdmin = localStorage.getItem("accessLevelId") === "1";

  // **useEffect: Maksutapojen haku**
  // Suoritetaan komponentin latautuessa ja kun 'reload'-tila muuttuu.
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        // Asetetaan token palveluun ja haetaan kaikki maksutavat
        const token = localStorage.getItem("token");
        PaymentMethodService.setToken(token);
        const data = await PaymentMethodService.getAll();
        setMethods(data);
      } catch (error) {
        // Virheenkäsittely haun epäonnistuessa
        setMessage('Maksutapojen haku epäonnistui');
        setIsPositive(false);
        setShowMessage(true);
        console.error(error);
      }
    };
    // Haetaan tiedot vain, jos käyttäjä on Admin
    if (isAdmin) fetchMethods();
  }, [reload]);

  // **handleAdd: Uuden maksutavan lisäys**
  const handleAdd = async () => {
    if (!newMethodName.trim()) return; // Estää tyhjän nimen lisäämisen
    try {
      // Kutsutaan palvelua uuden maksutavan luomiseksi
      await PaymentMethodService.create({ name: newMethodName.trim() });
      // Näytetään onnistumisviesti ja päivitetään lista
      setMessage(`Maksutapa '${newMethodName}' lisätty!`);
      setIsPositive(true);
      setShowMessage(true);
      setNewMethodName('');
      setReload(!reload);
    } catch (error) {
      // Virheenkäsittely lisäyksen epäonnistuessa
      setMessage('Lisäys epäonnistui');
      setIsPositive(false);
      setShowMessage(true);
      console.error(error);
    }
  };

  // **handleDelete: Maksutavan poisto**
  const handleDelete = async (id, name) => {
    // Varmistusikkuna ennen poistoa
    if (!window.confirm(`Poistetaanko maksutapa '${name}'?`)) return;
    try {
      // Kutsutaan palvelua poistamiseksi
      await PaymentMethodService.remove(id);
      // Näytetään onnistumisviesti ja päivitetään lista
      setMessage(`Maksutapa '${name}' poistettu!`);
      setIsPositive(true);
      setShowMessage(true);
      setReload(!reload);
    } catch (error) {
      // Virheenkäsittely poiston epäonnistuessa (esim. viite-eheysrikkomus)
      setMessage('Poisto epäonnistui. Maksutapaa ei voi poistaa, jos se on jo käytössä.');
      setIsPositive(false);
      setShowMessage(true);
      console.error(error);
    }
  };

  // **Ehdollinen renderöinti: Pääsynesto ei-Admin-käyttäjille**
  if (!isAdmin) {
    return <p style={{ color: 'red' }}>Access denied. Only admins can view this page.</p>;
  }

  // **Komponentin renderöinti**
  return (
    <div className="paymentmethods-container">
      <h2 className="paymentmethods-title">Maksutavat</h2>

      {/* Lisää maksutapa-lomake */}
      <div className="paymentmethods-form">
        <input
          type="text"
          placeholder="Uusi maksutapa"
          value={newMethodName}
          onChange={(e) => setNewMethodName(e.target.value)}
          className="paymentmethods-input"
        />
        <button onClick={handleAdd} className="paymentmethods-btn">Lisää</button>
        {/* Navigoi takaisin edelliselle sivulle */}
        <button className="paymentmethods-btn-back" onClick={() => navigate(-1)}>Takaisin</button>
      </div>

      {/* Maksutapojen lista taulukossa */}
      <table className="paymentmethods-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nimi</th>
            <th>Toiminnot</th>
          </tr>
        </thead>
        <tbody>
          {methods.map((m) => (
            <tr key={m.paymentMethodId}>
              <td>{m.paymentMethodId}</td>
              <td>{m.name}</td>
              <td>
                <button
                  className="paymentmethods-btn-delete"
                  onClick={() => handleDelete(m.paymentMethodId, m.name)} // Poistokäsittelijä
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentMethodList;
