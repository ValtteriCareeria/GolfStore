import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "./services/User";
import AddressService from "./services/AddressService";
import "./UserProfile.css";

const UserProfile = ({ setMessage, setIsPositive, setShowMessage }) => {
  const [user, setUser] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const navigate = useNavigate();
  const loggedInUserId = parseInt(localStorage.getItem("userId"));

  useEffect(() => {
    const fetchUserAndAddress = async () => {
      try {
        const token = localStorage.getItem("token");
        UserService.setToken(token);
        AddressService.setToken(token);

        const userData = await UserService.getById(loggedInUserId);
        setUser(userData);

        const addresses = await AddressService.getByUserId(loggedInUserId);
        const defaultAddr = addresses.find(a => a.isDefault);
        setDefaultAddress(defaultAddr || null);
      } catch (err) {
        console.error("Virhe käyttäjän tietojen haussa:", err);
        setMessage("Käyttäjän tietojen lataaminen epäonnistui.");
        setIsPositive(false);
        setShowMessage(true);
      }
    };

    if (loggedInUserId) fetchUserAndAddress();
  }, [loggedInUserId, setMessage, setIsPositive, setShowMessage]);

  if (!user) return <p>Ladataan käyttäjän tietoja...</p>;

  return (
    <div className="product-page profile-page">
      <h2 className="product-top-bar">Profiili</h2>

      <div className="profile-card product-item">
        <h3>Henkilötiedot</h3>
        <p><strong>Etunimi:</strong> {user.firstName}</p>
        <p><strong>Sukunimi:</strong> {user.lastName}</p>
        <p><strong>Sähköposti:</strong> {user.email}</p>
        <p><strong>Puhelin:</strong> {user.phoneNumber || "Ei ilmoitettu"}</p>
        <p><strong>Käyttäjätunnus:</strong> {user.userName}</p>
      </div>

      <div className="profile-card product-item">
        <h3>Oletusosoite</h3>
        {defaultAddress ? (
          <div className="address-section">
            <p>{defaultAddress.streetAddress}</p>
            <p>{defaultAddress.postalCode} {defaultAddress.city}</p>
            <p>{defaultAddress.country}</p>
            <button
              className="btn-submit"
              onClick={() => navigate(`/editaddress/${defaultAddress.addressId}`, { state: { from: "/profile" } })}
            >
              Muokkaa osoitetta
            </button>
          </div>
        ) : (
          <p>Osoitetta ei ole vielä lisätty.</p>
        )}
      </div>

      <div className="register-buttons myproducts-buttons">
        <button className="btn-submit" onClick={() => navigate("/myorders")}>
          Omat tilaukset
        </button>
        <button className="btn-back" onClick={() => navigate("/myproducts")}>
          Omat tuotteet
        </button>
        <button className="btn-submit" onClick={() => navigate("/changepassword")}>
          Vaihda salasana
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
