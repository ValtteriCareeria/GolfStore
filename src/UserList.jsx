import './UserList.css'
import React, { useState, useEffect } from 'react'
import UserService from './services/User'
import UserAdd from './UserAdd'
import UserEdit from './UserEdit'

const UserList = ({ user, setMessage, setIsPositive, setShowMessage }) => {
  const [users, setUsers] = useState([])
  const [lisäystila, setLisäystila] = useState(false)
  const [muokkaustila, setMuokkaustila] = useState(false)
  const [reload, reloadNow] = useState(false)
  const [muokattavaUser, setMuokattavaUser] = useState(false)
  const [searchLastName, setSearchLastName] = useState("")
  const [searchUserName, setSearchUserName] = useState("")

  const deleteUser = (user) => {
    let vastaus = window.confirm(`Remove User ${user.firstName}`)
    if (vastaus === true) {
      UserService.remove(user.userId)
        .then(res => {
          if (res.status === 200) {
            setMessage(`Successfully removed user ${user.firstName}`)
            setIsPositive(true)
            setShowMessage(true)
            window.scrollBy(0, -10000)
            setTimeout(() => setShowMessage(false), 5000)
            reloadNow(!reload)
          }
        })
        .catch(error => {
          setMessage(error.message)
          setIsPositive(false)
          setShowMessage(true)
          window.scrollBy(0, -10000)
          setTimeout(() => setShowMessage(false), 6000)
        })
    } else {
      setMessage('Poisto peruttu onnistuneesti.')
      setIsPositive(true)
      setShowMessage(true)
      window.scrollBy(0, -10000)
      setTimeout(() => setShowMessage(false), 5000)
    }
  }

  useEffect(() => {
    UserService.getAll().then(data => setUsers(data))
  }, [lisäystila, reload, muokkaustila])

  const editUser = (user) => {
    setMuokattavaUser(user)
    setMuokkaustila(true)
  }

  const clearFilters = () => {
    setSearchLastName("")
    setSearchUserName("")
  }

  return (
    <div >
      <div className="userlist-header">
        <h1>Users</h1>
        {!lisäystila && (
          <button className="userlist-add-btn" onClick={() => setLisäystila(true)}>
            ➕ Add new
          </button>
        )}
      </div>

      {lisäystila && (
        <UserAdd
          setLisäystila={setLisäystila}
          setIsPositive={setIsPositive}
          setMessage={setMessage}
          setShowMessage={setShowMessage}
        />
      )}

      {muokkaustila && (
        <UserEdit
          user={user}
          muokattavaUser={muokattavaUser}
          setMuokkaustila={setMuokkaustila}
          setIsPositive={setIsPositive}
          setMessage={setMessage}
          setShowMessage={setShowMessage}
        />
      )}

      {!lisäystila && !muokkaustila && (
        <>
          <div className="search-bar">
            <input
              className="search-input"
              placeholder="Search by Last Name"
              value={searchLastName}
              onChange={(e) => setSearchLastName(e.target.value.toLowerCase())}
            />
            <input
              className="search-input"
              placeholder="Search by Username"
              value={searchUserName}
              onChange={(e) => setSearchUserName(e.target.value.toLowerCase())}
            />
            <button className="clear-btn" onClick={clearFilters}>
              Clear filters
            </button>
          </div>

          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Firstname</th>
                  <th>Lastname</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Accesslevel</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users &&
                  users.map(u => {
                    const lowerCaseLastName = u.lastName.toLowerCase()
                    const lowerCaseUserName = u.userName.toLowerCase()
                    if (
                      (searchLastName === "" || lowerCaseLastName.includes(searchLastName)) &&
                      (searchUserName === "" || lowerCaseUserName.includes(searchUserName))
                    ) {
                      return (
                        <tr key={u.userId}>
                          <td>{u.firstName}</td>
                          <td>{u.lastName}</td>
                          <td>{u.userName}</td>
                          <td>{u.email}</td>
                          <td>{u.phoneNumber || 'Ei tietoa'}</td>
                          <td>{u.accesslevelId}</td>
                          <td className="actions">
                            <button className="action-btn action-btn-delete" onClick={() => deleteUser(u)}>Delete</button>
                            <button className="action-btn action-btn-edit" onClick={() => editUser(u)}>Edit</button>
                          </td>
                        </tr>
                      )
                    }
                    return null
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default UserList
