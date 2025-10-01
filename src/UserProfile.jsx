import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "./services/User";

const UserProfile = ({ setMessage, setIsPositive, setShowMessage }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const loggedInUserId = parseInt(localStorage.getItem("userId"));

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        UserService.setToken(token);
        const data = await UserService.getById(loggedInUserId);
        setUser(data);
      } catch (err) {
        console.error("Virhe käyttäjän tietojen haussa:", err);
        setMessage("Käyttäjän tietojen lataaminen epäonnistui.");
        setIsPositive(false);
        setShowMessage(true);
      }
    };
    if (loggedInUserId) fetchUser();
  }, [loggedInUserId, setMessage, setIsPositive, setShowMessage]);

  if (!user) return <p>Ladataan käyttäjän tietoja...</p>;

  return (
    <div className="profile-page">
      <h2>Profiili</h2>
      <p><strong>Etunimi:</strong> {user.firstName}</p>
      <p><strong>Sukunimi:</strong> {user.lastName}</p>
      <p><strong>Sähköposti:</strong> {user.email}</p>
      <p><strong>Puhelin:</strong> {user.phoneNumber || "Ei ilmoitettu"}</p>
      <p><strong>Käyttäjätunnus:</strong> {user.userName}</p>

      <div className="register-buttons">
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
