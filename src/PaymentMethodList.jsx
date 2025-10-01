import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentMethodService from './services/PaymentMethod';
import './PaymentMethodList.css';

const PaymentMethodList = ({ setMessage, setIsPositive, setShowMessage }) => {
  const [methods, setMethods] = useState([]);
  const [newMethodName, setNewMethodName] = useState('');
  const [reload, setReload] = useState(false);

  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("accessLevelId") === "1";

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const token = localStorage.getItem("token");
        PaymentMethodService.setToken(token);
        const data = await PaymentMethodService.getAll();
        setMethods(data);
      } catch (error) {
        setMessage('Maksutapojen haku epäonnistui');
        setIsPositive(false);
        setShowMessage(true);
        console.error(error);
      }
    };
    if (isAdmin) fetchMethods();
  }, [reload]);

  const handleAdd = async () => {
    if (!newMethodName.trim()) return;
    try {
      await PaymentMethodService.create({ name: newMethodName.trim() });
      setMessage(`Maksutapa '${newMethodName}' lisätty!`);
      setIsPositive(true);
      setShowMessage(true);
      setNewMethodName('');
      setReload(!reload);
    } catch (error) {
      setMessage('Lisäys epäonnistui');
      setIsPositive(false);
      setShowMessage(true);
      console.error(error);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Poistetaanko maksutapa '${name}'?`)) return;
    try {
      await PaymentMethodService.remove(id);
      setMessage(`Maksutapa '${name}' poistettu!`);
      setIsPositive(true);
      setShowMessage(true);
      setReload(!reload);
    } catch (error) {
      setMessage('Poisto epäonnistui. Maksutapaa ei voi poistaa, jos se on jo käytössä.');
      setIsPositive(false);
      setShowMessage(true);
      console.error(error);
    }
  };

  if (!isAdmin) {
    return <p style={{ color: 'red' }}>Access denied. Only admins can view this page.</p>;
  }

  return (
    <div className="paymentmethods-container">
      <h2 className="paymentmethods-title">Maksutavat</h2>

      {/* Lisää maksutapa */}
      <div className="paymentmethods-form">
        <input
          type="text"
          placeholder="Uusi maksutapa"
          value={newMethodName}
          onChange={(e) => setNewMethodName(e.target.value)}
          className="paymentmethods-input"
        />
        <button onClick={handleAdd} className="paymentmethods-btn">Lisää</button>
        <button className="paymentmethods-btn-back" onClick={() => navigate(-1)}>Takaisin</button>
      </div>

      {/* Maksutavat lista */}
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
                  onClick={() => handleDelete(m.paymentMethodId, m.name)}
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
