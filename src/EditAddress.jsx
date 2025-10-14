import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import addressService from "./services/AddressService";

const EditAddress = ({ setMessage, setIsPositive, setShowMessage }) => {
  const { id } = useParams(); // Osoitteen ID
  const navigate = useNavigate();
  const location = useLocation(); // Tiedon lähde
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  // location.state.from voi olla "profile" tai "cartadd"
  const returnPage = location.state?.from || "/profile";

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const token = localStorage.getItem("token");
        addressService.setToken(token);
        const data = await addressService.getById(id);
        setStreetAddress(data.streetAddress);
        setCity(data.city);
        setPostalCode(data.postalCode);
        setCountry(data.country);
      } catch (err) {
        console.error("Virhe osoitteen haussa:", err);
        setMessage?.("Osoitteen lataaminen epäonnistui.");
        setIsPositive?.(false);
        setShowMessage?.(true);
      }
    };

    fetchAddress();
  }, [id, setMessage, setIsPositive, setShowMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      addressService.setToken(token);

      await addressService.update(id, {
        streetAddress,
        city,
        postalCode,
        country,
        isDefault: true,
      });

      setMessage?.("Osoitetta päivitettiin onnistuneesti.");
      setIsPositive?.(true);
      setShowMessage?.(true);
      setTimeout(() => setShowMessage(false), 5000);

      navigate(returnPage); // Palaa oikealle sivulle
    } catch (err) {
      console.error("Virhe osoitteen päivityksessä:", err);
      setMessage?.("Osoitteen päivitys epäonnistui.");
      setIsPositive?.(false);
      setShowMessage?.(true);
      setTimeout(() => setShowMessage(false), 5000);
    }
  };

  return (
    <div className="edit-container">
      <h2 className="edit-title">Muokkaa osoitetta</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <input
          type="text"
          placeholder="Katuosoite"
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          required
          className="edit-input"
        />
        <input
          type="text"
          placeholder="Kaupunki"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="edit-input"
        />
        <input
          type="text"
          placeholder="Postinumero"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
          className="edit-input"
        />
        <input
          type="text"
          placeholder="Maa"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
          className="edit-input"
        />

        <div className="edit-buttons">
          <input type="submit" value="Tallenna" className="btn-black" />
          <input
            type="button"
            value="Takaisin"
            onClick={() => navigate(returnPage)}
            className="btn-black"
          />
        </div>
      </form>
    </div>
  );
};

export default EditAddress;
