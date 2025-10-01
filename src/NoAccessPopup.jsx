import React, { useEffect, useState } from 'react';
import './NoAccessPopup.css';

const NoAccessPopup = ({ show, onClose }) => {
  const [visible, setVisible] = useState(false);

  // Näytetään popup kun show muuttuu trueksi
  useEffect(() => {
    if (show) {
      setVisible(true);
    }
  }, [show]);

  // Sulkeminen Esc-näppäimellä
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleClose = () => {
    // Käynnistetään fade-out ennen DOM:sta poistamista
    setVisible(false);
    setTimeout(onClose, 300); // sama duration kuin CSS-transition
  };

  return (
    <div
      className={`popup-overlay ${show ? (visible ? 'show' : 'hide') : ''}`}
      onClick={handleClose}
    >
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h2>Ei oikeuksia</h2>
        <p>Sinulla ei ole oikeuksia muokata tätä tuotetta.</p>
        <button className="btn-black" onClick={handleClose}>Takaisin</button>
      </div>
    </div>
  );
};

export default NoAccessPopup;
