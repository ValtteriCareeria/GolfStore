import React, { useState } from 'react';
import LoginService from './services/Auth';
import { useNavigate } from "react-router-dom";
import md5 from 'md5';
import './Login.css';

const Login = ({ setIsPositive, setMessage, setShowMessage, setLoggedInUser }) => {
    const [Username, setUsername] = useState('');
    const [Password, setPassword] = useState('');
    const navigate = useNavigate();

    // Käsittelijä kirjautumislomakkeen lähetykselle
    const handleSubmit = (event) => {
        // Estetään lomakkeen oletuslähetys (sivun uudelleenlataus)
        event.preventDefault();

        // Luodaan todennukseen tarvittava objekti
        const userForAuth = {
            username: Username,
            password: Password,
            // Lasketaan salasanasta MD5-tiiviste palvelinta varten
            passwordMd5: md5(Password)
        };

        // Kutsutaan autentikointipalvelua
        LoginService.authenticate(userForAuth)
            .then(response => {
                // Tarkistetaan, että kirjautuminen onnistui (HTTP 200)
                if (response.status === 200) {
                    const user = response.data;
                    
                    // **Onnistunut kirjautuminen:** Tallennetaan käyttäjätiedot selaimeen (localStorage)
                    localStorage.setItem("username", user.username);
                    localStorage.setItem("accessLevelId", user.accesslevelId); 
                    localStorage.setItem("token", user.token);
                    localStorage.setItem("userId", user.userId);
                    // Tallennetaan koko käyttäjäobjekti JSON-muodossa
                    localStorage.setItem("user", JSON.stringify(user));

                    // Päivitetään React-tila kirjautuneella käyttäjällä
                    setLoggedInUser(user.username);
                    
                    // Näytetään onnistumisviesti (positiivinen)
                    setMessage(`Logged in as: ${user.username}`);
                    setIsPositive(true);
                    setShowMessage(true);

                    // Piilotetaan viesti 5 sekunnin kuluttua
                    setTimeout(() => setShowMessage(false), 5000);
                }
            })
            .catch(error => {
                // **Kirjautuminen epäonnistui:** Käsitellään virheet
                if (error.response) {
                    // Palvelin antoi vastauksen, käytetään sen virheviestiä
                    setMessage(`Virhe: ${error.response.data.message || 'Kirjautuminen epäonnistui.'}`);
                } else {
                    // Verkkovirhe tai palvelin ei vastaa
                    setMessage('Verkkovirhe tai palvelin ei vastaa.');
                }
                // Näytetään virheviesti (negatiivinen)
                setIsPositive(false);
                setShowMessage(true);
                
                // Piilotetaan viesti 6 sekunnin kuluttua
                setTimeout(() => setShowMessage(false), 6000);
            });
    };

    // Funktio syöttökenttien tyhjentämiseen
    const emptyFields = () => {
        setUsername("");
        setPassword("");
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Kirjaudu sisään </h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={Username}
                        placeholder="Käyttäjätunnus"
                        onChange={({ target }) => setUsername(target.value)}
                        required
                    />
                    <input
                        type="password"
                        value={Password}
                        placeholder="Salasana"
                        onChange={({ target }) => setPassword(target.value)}
                        required
                    />
                    <div className="button-group">
                        <button type="submit" className="login-btn">Login</button>
                        <button type="button" className="login-btn login-btn-danger" onClick={emptyFields}>Tyhjennä</button>
                        <button type="button" className="login-btn login-btn-register" onClick={() => navigate(`/register`)}>Rekisteröidy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
