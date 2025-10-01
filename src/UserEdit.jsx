import React, { useState } from 'react'
import UserService from './services/User'
import './UserEdit.css'
import md5 from 'md5'

const UserEdit = ({ setMuokkaustila, setIsPositive, setMessage, setShowMessage, muokattavaUser }) => {
  // Komponentin tilat
  const [userId] = useState(muokattavaUser.userId)
  const [firstName, setFirstName] = useState(muokattavaUser.firstName || "")
  const [lastName, setLastName] = useState(muokattavaUser.lastName || "")
  const [email, setEmail] = useState(muokattavaUser.email || "")
  const [phoneNumber, setPhoneNumber] = useState(muokattavaUser.phoneNumber || "")
  const [accesslevelId, setAccesslevelId] = useState(muokattavaUser.accesslevelId || 2)
  const [userName, setUserName] = useState(muokattavaUser.userName || "")
  const [password, setPassword] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()

    const updatedUser = {
      userId,
      firstName,
      lastName,
      email,
      phoneNumber,
      accesslevelId: parseInt(accesslevelId),
      userName
    }

    if (password.trim() !== "") {
      updatedUser.password = md5(password)
    }

    UserService.update(updatedUser)
      .then(response => {
        if (response.status === 200) {
          setMessage(`Edited User: ${updatedUser.firstName}`)
          setIsPositive(true)
          setShowMessage(true)

          setTimeout(() => {
            setShowMessage(false)
          }, 5000)

          setMuokkaustila(false)
        }
      })
      .catch(error => {
        setMessage(error.message || "Update failed")
        setIsPositive(false)
        setShowMessage(true)

        setTimeout(() => {
          setShowMessage(false)
        }, 6000)
      })
  }

  return (
    <div id="editUser" className="edit-container">
      <h2 className="edit-title">Edit User</h2>

      <form onSubmit={handleSubmit} className="edit-form">
        <input type="text" value={userId} disabled className="edit-input" />

        <input
          type="text"
          value={firstName}
          placeholder="First name"
          onChange={({ target }) => setFirstName(target.value)}
          required
          className="edit-input"
        />

        <input
          type="text"
          value={lastName}
          placeholder="Last name"
          onChange={({ target }) => setLastName(target.value)}
          required
          className="edit-input"
        />

        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={({ target }) => setEmail(target.value)}
          className="edit-input"
        />

        <input
          type="text"
          value={phoneNumber}
          placeholder="Phone number"
          onChange={({ target }) => setPhoneNumber(target.value)}
          className="edit-input"
        />

        <input
          type="number"
          value={accesslevelId}
          placeholder="Access level"
          onChange={({ target }) => setAccesslevelId(target.value)}
          className="edit-input"
        />

        <input
          type="text"
          value={userName}
          placeholder="Username"
          onChange={({ target }) => setUserName(target.value)}
          className="edit-input"
        />

        <input
          type="password"
          value={password}
          placeholder="New password (leave blank to keep old)"
          onChange={({ target }) => setPassword(target.value)}
          className="edit-input"
        />

        <div className="edit-buttons">
          <input type="submit" value="Save" className="btn-red" />
          <input
            type="button"
            value="Back"
            onClick={() => setMuokkaustila(false)}
            className="btn-black"
          />
        </div>
      </form>
    </div>
  )
}

export default UserEdit
