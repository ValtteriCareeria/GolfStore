import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "./services/User";
import md5 from "md5";

const ChangePassword = ({ setMessage, setIsPositive, setShowMessage }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  // Haetaan nykyisen käyttäjän ID localStorage-muistista ja muunnetaan numeroksi.
  const userId = parseInt(localStorage.getItem("userId"));

  // Laskettu arvo tarkistamaan täsmäävätkö salasanat.
  const passwordsMatch = newPassword === confirmPassword;

  // Käsittelijä salasanan vaihtolomakkeen lähetykselle
  const handleSubmit = async (e) => {
    // Estetään lomakkeen oletuslähetys (sivun uudelleenlataus)
    e.preventDefault();
    
    // Tarkistetaan ensin, että uusi salasana ja vahvistus täsmäävät.
    if (newPassword !== confirmPassword) {
      // Jos eivät täsmää, näytetään virheviesti ja keskeytetään.
      setMessage("Uusi salasana ja vahvistus eivät täsmää.");
      setIsPositive(false);
      setShowMessage(true);
      return;
    }

    try {
      // 1. Haetaan nykyiset käyttäjätiedot palvelusta ID:n perusteella.
      const user = await UserService.getById(userId);
      
      // 2. Päivitetään käyttäjäobjektin salasana MD5-tiivisteenä.
      user.password = md5(newPassword);

      // 3. Kutsutaan palvelua päivittämään käyttäjän tiedot (uusi salasana) kantaan.
      await UserService.update(user);

      // Onnistunut päivitys: näytetään positiivinen viesti.
      setMessage("Salasana vaihdettu onnistuneesti!");
      setIsPositive(true);
      setShowMessage(true);
      
      // Navigoidaan takaisin profiilisivulle.
      navigate("/profile");
    } catch (error) {
      // Virheen käsittely API-kutsussa. Haetaan virheviesti vastauksesta.
      const errMsg = error.response?.data?.message || JSON.stringify(error.response?.data) || "Virhe salasanan vaihdossa.";
      setMessage(errMsg);
      setIsPositive(false);
      setShowMessage(true);
    }
  };

  return (
    <div className="edit-container">
      <h2 className="edit-title">Vaihda salasana</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <input
          type="password"
          placeholder="Uusi salasana"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="edit-input"
        />
        <input
          type="password"
          placeholder="Vahvista uusi salasana"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="edit-input"
        />
        {/* Näytetään virheteksti, jos salasanat eivät täsmää ja toinen kenttä on täytetty. */}
        {!passwordsMatch && confirmPassword.length > 0 && (
          <p className="fade-in error-text">Salasanat eivät täsmää!</p>
        )}

        <div className="edit-buttons">
          <input type="submit" value="Tallenna" className="btn-black" />
          <input
            type="button"
            value="Takaisin"
            onClick={() => navigate("/profile")}
            className="btn-black"
          />
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
