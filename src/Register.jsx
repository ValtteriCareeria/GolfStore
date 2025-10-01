import React, { useState } from 'react'
import UserService from './services/User'
import md5 from 'md5'
import { useNavigate } from 'react-router-dom'

const Register = ({ setIsPositive, setMessage, setShowMessage }) => {
  const [newFirstname, setNewFirstname] = useState('')
  const [newLastname, setNewLastname] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')   
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const passwordsMatch = newPassword === confirmPassword
  const navigate = useNavigate()

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!passwordsMatch) {
      setMessage("Salasanat eivät täsmää!")
      setIsPositive(false)
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 5000)
      return
    }

    const newUser = {
      firstname: newFirstname,
      lastname: newLastname,
      email: newEmail,
      phoneNumber: newPhone,   
      accesslevelId: 2,
      username: newUsername,
      password: md5(newPassword)
    }

    UserService.create(newUser)
      .then(response => {
        if (response.status === 200) {
          setMessage(`Käyttäjä lisätty: ${newUser.firstname} ${newUser.lastname}`)
          setIsPositive(true)
          setShowMessage(true)
          setTimeout(() => setShowMessage(false), 5000)
          navigate(-1)
        }
      })
      .catch(error => {
        setMessage(error.message || "Käyttäjän luonti epäonnistui")
        setIsPositive(false)
        setShowMessage(true)
        setTimeout(() => setShowMessage(false), 6000)
      })
  }

  return (
    <div className="register-container">
      <div className="register-grid">
        {/* Vasemmalla info/kuvaus */}
        <div className="register-info">
          <h2>Tervetuloa GolfStoreen!</h2>
          <p>Rekisteröitymällä saat: </p>
          <ul>
            <li>Pikaostokset ilman rekisteröitymistä</li>
            <li>Seuranta tilauksillesi</li>
            <li>Erikoistarjoukset ja kampanjat</li>
          </ul>
          <img src="/assets/golf-store.png" alt="Golf Store" className="register-image" />
        </div>

        {/* Oikealla rekisteröintilomake */}
        <form onSubmit={handleSubmit} className="register-form">
          <h3>Luo uusi tili</h3>
          <input type="text" value={newFirstname} placeholder="Etunimi"
            onChange={({ target }) => setNewFirstname(target.value)} required />
          <input type="text" value={newLastname} placeholder="Sukunimi"
            onChange={({ target }) => setNewLastname(target.value)} required />
          <input type="email" value={newEmail} placeholder="Sähköposti"
            onChange={({ target }) => setNewEmail(target.value)} required />
          <input type="text" value={newPhone} placeholder="Puhelinnumero"
            onChange={({ target }) => setNewPhone(target.value)} />
          <input type="text" value={newUsername} placeholder="Käyttäjätunnus"
            onChange={({ target }) => setNewUsername(target.value)} required />
          <input type="password" value={newPassword} placeholder="Salasana"
            onChange={({ target }) => setNewPassword(target.value)} required />
          <input type="password" value={confirmPassword} placeholder="Vahvista salasana"
            onChange={({ target }) => setConfirmPassword(target.value)} required />

          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="error-text">Salasana ei täsmää!</p>
          )}

          <div className="register-buttons">
            <input type="submit" value="Rekisteröidy" className="btn-submit" />
            <input type="button" value="Takaisin" onClick={() => navigate(-1)} className="btn-back" />
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register;
