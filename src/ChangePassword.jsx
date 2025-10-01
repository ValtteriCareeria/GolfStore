import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "./services/User";
import md5 from "md5";

const ChangePassword = ({ setMessage, setIsPositive, setShowMessage }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const userId = parseInt(localStorage.getItem("userId"));

  const passwordsMatch = newPassword === confirmPassword;

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (newPassword !== confirmPassword) {
    setMessage("Uusi salasana ja vahvistus eivät täsmää.");
    setIsPositive(false);
    setShowMessage(true);
    return;
  }

  try {
    const user = await UserService.getById(userId);
    user.password = md5(newPassword);

    await UserService.update(user);

    setMessage("Salasana vaihdettu onnistuneesti!");
    setIsPositive(true);
    setShowMessage(true);
    navigate("/profile");
  } catch (error) {
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
