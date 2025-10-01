import React, { useState } from 'react';
import LoginService from './services/Auth';
import { useNavigate } from "react-router-dom";
import md5 from 'md5';
import './Login.css'; 

const Login = ({ setIsPositive, setMessage, setShowMessage, setLoggedInUser }) => {
    const [Username, setUsername] = useState('');
    const [Password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();

        // Lähetetään sekä alkuperäinen salasana että MD5-hash
        const userForAuth = { 
            username: Username, 
            password: Password,
            passwordMd5: md5(Password)
        };

        LoginService.authenticate(userForAuth)
            .then(response => {
                if (response.status === 200) {
                    const user = response.data;
                    localStorage.setItem("username", user.username);
                    localStorage.setItem("accessLevelId", user.accesslevelId);              
                    localStorage.setItem("token", user.token);
                    localStorage.setItem("userId", user.userId);
                    localStorage.setItem("user", JSON.stringify(user));

                    setLoggedInUser(user.username);
                    setMessage(`Logged in as: ${user.username}`);
                    setIsPositive(true);
                    setShowMessage(true);

                    setTimeout(() => setShowMessage(false), 5000);
                }
            })
            .catch(error => {
                if (error.response) {
                    setMessage(`Virhe: ${error.response.data.message || 'Kirjautuminen epäonnistui.'}`);
                } else {
                    setMessage('Verkkovirhe tai palvelin ei vastaa.');
                }
                setIsPositive(false);
                setShowMessage(true);
                setTimeout(() => setShowMessage(false), 6000);
            });
    };

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
