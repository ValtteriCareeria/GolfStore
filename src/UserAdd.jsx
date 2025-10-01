import './App.css'
import React, { useState } from 'react'
import UserService from './services/User'
import md5 from 'md5'

const UserAdd = ({ setLisäystila, setIsPositive, setMessage, setShowMessage }) => {

  // Komponentin tilat
  const [newFirstname, setNewFirstname] = useState('')
  const [newLastname, setNewLastname] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhoneNumber, setNewPhoneNumber] = useState('')   // uusi tila
  const [newAccesslevelId, setNewAccesslevelId] = useState(2)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const passwordsMatch = newPassword === confirmPassword

  // onSubmit
  const handleSubmit = (event) => {
    event.preventDefault()

    if (!passwordsMatch) {
      setMessage("Passwords do not match!")
      setIsPositive(false)
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 5000)
      return
    }

    const newUser = {
      firstname: newFirstname,
      lastname: newLastname,
      email: newEmail,
      phoneNumber: newPhoneNumber,   // lisätty tänne
      accesslevelId: parseInt(newAccesslevelId),
      username: newUsername,
      password: md5(newPassword)
    }

    console.log(newUser)

    UserService.create(newUser)
      .then(response => {
        if (response.status === 200) {
          setMessage(`Added new User: ${newUser.firstname} ${newUser.lastname}`)
          setIsPositive(true)
          setShowMessage(true)

          setTimeout(() => {
            setShowMessage(false)
          }, 5000)

          setLisäystila(false)
        }
      })
      .catch(error => {
        setMessage(error)
        setIsPositive(false)
        setShowMessage(true)

        setTimeout(() => {
          setShowMessage(false)
        }, 6000)
      })
  }

  return (
    <div id="addNew" className="edit-container">
      <h2 className="edit-title">User Add</h2>

      <form onSubmit={handleSubmit} className="edit-form">
        <input type="text" value={newFirstname} placeholder="First name"
          onChange={({ target }) => setNewFirstname(target.value)} required className="edit-input" />

        <input type="text" value={newLastname} placeholder="Last name"
          onChange={({ target }) => setNewLastname(target.value)} required className="edit-input" />

        <input type="email" value={newEmail} placeholder="Email"
          onChange={({ target }) => setNewEmail(target.value)} className="edit-input" />

        <input type="text" value={newPhoneNumber} placeholder="Phone number"
          onChange={({ target }) => setNewPhoneNumber(target.value)} className="edit-input" />   {/* uusi kenttä */}

        <input type="number" value={newAccesslevelId} placeholder="Access level"
          onChange={({ target }) => setNewAccesslevelId(target.value)} className="edit-input" />

        <input type="text" value={newUsername} placeholder="Username"
          onChange={({ target }) => setNewUsername(target.value)} className="edit-input" />

        <input type="password" value={newPassword} placeholder="Password"
          onChange={({ target }) => setNewPassword(target.value)} required className="edit-input" />

        <input type="password" value={confirmPassword} placeholder="Confirm password"
          onChange={({ target }) => setConfirmPassword(target.value)} required className="edit-input" />

        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="fade-in error-text">Salasana ei ole sama!</p>
        )}

        <div className="edit-buttons">
          <input type="submit" value="Save" className="btn-red" />
          <input type="button" value="Back" onClick={() => setLisäystila(false)} className="btn-black" />
        </div>
      </form>
    </div>
  )
}

export default UserAdd
