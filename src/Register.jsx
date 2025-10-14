import React, { useState } from 'react'
import UserService from './services/User' 
import md5 from 'md5' 
import { useNavigate } from 'react-router-dom' 

// Register-komponentti uuden käyttäjän rekisteröimiseksi
// Ottaa vastaan propsit viestien ja ilmoitusten hallintaan
const Register = ({ setIsPositive, setMessage, setShowMessage }) => {
    // Tilat uusille käyttäjätiedoille:
    const [newFirstname, setNewFirstname] = useState('') // Uusi etunimi
    const [newLastname, setNewLastname] = useState('') // Uusi sukunimi
    const [newEmail, setNewEmail] = useState('') // Uusi sähköposti
    const [newPhone, setNewPhone] = useState('') // Uusi puhelinnumero
    const [newUsername, setNewUsername] = useState('') // Uusi käyttäjätunnus
    const [newPassword, setNewPassword] = useState('') // Uusi salasana
    const [confirmPassword, setConfirmPassword] = useState('') // Salasanan vahvistus

    // Laskettu arvo tarkistamaan, täsmäävätkö salasanat
    const passwordsMatch = newPassword === confirmPassword
    // Navigointifunktio reitittämiseen
    const navigate = useNavigate()

    // Lomakkeen lähetyskäsittelijä
    const handleSubmit = (event) => {
        event.preventDefault() // Estää selaimen oletuslähetyksen

        // Tarkistus: Jos salasanat eivät täsmää, näytä virheviesti ja keskeytä
        if (!passwordsMatch) {
            setMessage("Salasanat eivät täsmää!")
            setIsPositive(false) // Asetetaan virheväri viestille
            setShowMessage(true)
            setTimeout(() => setShowMessage(false), 5000)
            return // Keskeytä suoritus
        }

        // Luodaan uusi käyttäjäobjekti lähetettäväksi
        const newUser = {
            firstname: newFirstname,
            lastname: newLastname,
            email: newEmail,
            phoneNumber: newPhone,
            accesslevelId: 2, // Asetetaan oletuskäyttöoikeustaso (esim. tavallinen asiakas)
            username: newUsername,
            password: md5(newPassword) // Salasanan tiivistäminen ennen lähetystä
        }

        // Kutsutaan UserServiceä luomaan uusi käyttäjä
        UserService.create(newUser)
            .then(response => {
                // Käsittele onnistunut vastaus (esim. HTTP 200)
                if (response.status === 200) {
                    setMessage(`Käyttäjä lisätty: ${newUser.firstname} ${newUser.lastname}`)
                    setIsPositive(true) // Asetetaan onnistumisväri viestille
                    setShowMessage(true)
                    setTimeout(() => setShowMessage(false), 5000)
                    navigate(-1) // Navigoidaan takaisin edelliselle sivulle
                }
            })
            .catch(error => {
                // Käsittele virhe
                setMessage(error.message || "Käyttäjän luonti epäonnistui")
                setIsPositive(false)
                setShowMessage(true)
                setTimeout(() => setShowMessage(false), 6000) // Näytä virheviesti hieman pidempään
            })
    }

    return (
        // Rekisteröintinäkymän pääkontti
        <div className="register-container">
            <div className="register-grid">
                {/* Vasemmalla info/kuvaus-osio */}
                <div className="register-info">
                    <h2>Tervetuloa GolfStoreen!</h2>
                    <p>Rekisteröitymällä saat: </p>
                    <ul>
                        <li>Pikaostokset ilman rekisteröitymistä</li>
                        <li>Seuranta tilauksillesi</li>
                        <li>Erikoistarjoukset ja kampanjat</li>
                    </ul>
                    {/* Kuva kaupasta (huom: /assets/golf-store.png vaatii olemassa olevan tiedoston) */}
                    <img src="/assets/golf-store.png" alt="Golf Store" className="register-image" />
                </div>

                {/* Oikealla rekisteröintilomake */}
                <form onSubmit={handleSubmit} className="register-form">
                    <h3>Luo uusi tili</h3>
                    {/* Etunimi-kenttä */}
                    <input type="text" value={newFirstname} placeholder="Etunimi"
                        onChange={({ target }) => setNewFirstname(target.value)} required />
                    {/* Sukunimi-kenttä */}
                    <input type="text" value={newLastname} placeholder="Sukunimi"
                        onChange={({ target }) => setNewLastname(target.value)} required />
                    {/* Sähköposti-kenttä */}
                    <input type="email" value={newEmail} placeholder="Sähköposti"
                        onChange={({ target }) => setNewEmail(target.value)} required />
                    {/* Puhelinnumero-kenttä */}
                    <input type="text" value={newPhone} placeholder="Puhelinnumero"
                        onChange={({ target }) => setNewPhone(target.value)} />
                    {/* Käyttäjätunnus-kenttä */}
                    <input type="text" value={newUsername} placeholder="Käyttäjätunnus"
                        onChange={({ target }) => setNewUsername(target.value)} required />
                    {/* Salasana-kenttä */}
                    <input type="password" value={newPassword} placeholder="Salasana"
                        onChange={({ target }) => setNewPassword(target.value)} required />
                    {/* Vahvista salasana -kenttä */}
                    <input type="password" value={confirmPassword} placeholder="Vahvista salasana"
                        onChange={({ target }) => setConfirmPassword(target.value)} required />

                    {/* Salasanan täsmäämisen virheviesti näkyy vain jos on yritetty vahvistaa, mutta ei täsmää */}
                    {confirmPassword.length > 0 && !passwordsMatch && (
                        <p className="error-text">Salasana ei täsmää!</p>
                    )}

                    {/* Lomakkeen toimintopainikkeet */}
                    <div className="register-buttons">
                        {/* Lähetyspainike rekisteröitymiseen */}
                        <input type="submit" value="Rekisteröidy" className="btn-submit" />
                        {/* Takaisin-painike, käyttää navigate(-1) siirtyäkseen edelliseen reittiin */}
                        <input type="button" value="Takaisin" onClick={() => navigate(-1)} className="btn-back" />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register;
