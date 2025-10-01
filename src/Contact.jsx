import React, { useState } from "react";
import "./Pages.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Kiitos viestistäsi! Otamme yhteyttä pian.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Ota yhteyttä</h2>
      <p className="page-text">
        Mikäli sinulla on kysyttävää tilauksista, tuotteista tai
        asiakaspalvelusta, voit olla meihin yhteydessä alla olevan lomakkeen
        kautta.
      </p>

      <form onSubmit={handleSubmit} className="contact-form">
        <input
          type="text"
          name="name"
          placeholder="Nimi"
          value={formData.name}
          onChange={handleChange}
          required
          className="edit-input"
        />
        <input
          type="email"
          name="email"
          placeholder="Sähköposti"
          value={formData.email}
          onChange={handleChange}
          required
          className="edit-input"
        />
        <textarea
          name="message"
          placeholder="Kirjoita viestisi..."
          value={formData.message}
          onChange={handleChange}
          required
          className="edit-input"
          rows="5"
        />
        <div className="edit-buttons">
          <button type="submit" className="btn-red">Lähetä</button>
        </div>
      </form>
    </div>
  );
};

export default Contact;
