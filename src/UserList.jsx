import './UserList.css'
import React, { useState, useEffect } from 'react'
import UserService from './services/User.js' // Korjattu polku lisäämällä .js-pääte
import UserAdd from './UserAdd.jsx' // Oletetaan, että komponentti on .jsx-tiedosto
import UserEdit from './UserEdit.jsx' // Oletetaan, että komponentti on .jsx-tiedosto

// UserList-komponentti, joka näyttää, lisää ja muokkaa käyttäjiä.
// Se ottaa vastaan propseja viestien näyttämiseen.
const UserList = ({ user, setMessage, setIsPositive, setShowMessage }) => {
    // Tila kaikkien käyttäjien säilyttämiseen.
    const [users, setUsers] = useState([])
    // Tila, joka ohjaa uuden käyttäjän lisäysnäkymän näkyvyyttä.
    const [lisäystila, setLisäystila] = useState(false)
    // Tila, joka ohjaa käyttäjän muokkausnäkymän näkyvyyttä.
    const [muokkaustila, setMuokkaustila] = useState(false)
    // Tila, jota käytetään tietojen uudelleenlatauksen käynnistämiseen (togglaamalla).
    const [reload, reloadNow] = useState(false)
    // Tila muokattavana olevan käyttäjäobjektin säilyttämiseen.
    const [muokattavaUser, setMuokattavaUser] = useState(false)
    // Tila sukunimen perusteella tapahtuvan haun syötteelle.
    const [searchLastName, setSearchLastName] = useState("")
    // Tila käyttäjätunnuksen perusteella tapahtuvan haun syötteelle.
    const [searchUserName, setSearchUserName] = useState("")

    // Funktio käyttäjän poistamiseen
    const deleteUser = (user) => {
        // Vahvistusikkuna ennen poistoa
        // Pitäisi korvata mukautetulla modaalilla!
        let vastaus = window.confirm(`Remove User ${user.firstName}`)
        if (vastaus === true) {
            // Kutsutaan UserServiceä poistamaan käyttäjä ID:n perusteella
            UserService.remove(user.userId)
                .then(res => {
                    if (res.status === 200) {
                        // Näytetään onnistumisviesti
                        setMessage(`Successfully removed user ${user.firstName}`)
                        setIsPositive(true)
                        setShowMessage(true)
                        window.scrollBy(0, -10000)
                        setTimeout(() => setShowMessage(false), 5000)
                        // Päivitetään reload-tila, jotta useEffect hakee listan uudelleen
                        reloadNow(!reload)
                    }
                })
                .catch(error => {
                    // Virheen käsittely poiston epäonnistuessa
                    setMessage(error.message)
                    setIsPositive(false)
                    setShowMessage(true)
                    window.scrollBy(0, -10000)
                    setTimeout(() => setShowMessage(false), 6000)
                })
        } else {
            // Viesti poiston peruutuksesta
            setMessage('Poisto peruttu onnistuneesti.')
            setIsPositive(true)
            setShowMessage(true)
            window.scrollBy(0, -10000)
            setTimeout(() => setShowMessage(false), 5000)
        }
    }

    // useEffect-hook käyttäjätietojen hakemiseen palvelimelta.
    // Ajetaan komponentin latautuessa ja aina kun lisäystila, reload tai muokkaustila muuttuu.
    useEffect(() => {
        UserService.getAll().then(data => setUsers(data)) // Haetaan kaikki käyttäjät ja asetetaan tilaan
    }, [lisäystila, reload, muokkaustila])

    // Funktio, joka asettaa käyttäjän muokkaustilaan
    const editUser = (user) => {
        setMuokattavaUser(user) // Asetetaan muokattava käyttäjä
        setMuokkaustila(true) // Vaihdetaan muokkausnäkymään
    }

    // Funktio hakukenttien tyhjentämiseksi
    const clearFilters = () => {
        setSearchLastName("")
        setSearchUserName("")
    }

    // Komponentin renderöinti
    return (
        <div >
            <div className="userlist-header">
                <h1>Users</h1>
                {/* Lisää uusi -painike näytetään vain, kun lisäystila ei ole päällä */}
                {!lisäystila && (
                    <button className="userlist-add-btn" onClick={() => setLisäystila(true)}>
                        ➕ Add new
                    </button>
                )}
            </div>

            {/* Renderöidään UserAdd-komponentti, jos lisäystila on päällä */}
            {lisäystila && (
                <UserAdd
                    setLisäystila={setLisäystila}
                    setIsPositive={setIsPositive}
                    setMessage={setMessage}
                    setShowMessage={setShowMessage}
                />
            )}

            {/* Renderöidään UserEdit-komponentti, jos muokkaustila on päällä */}
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

            {/* Käyttäjälista ja suodattimet näytetään vain, kun lisäys/muokkaustilat eivät ole päällä */}
            {!lisäystila && !muokkaustila && (
                <>
                    <div className="search-bar">
                        {/* Hakukenttä sukunimen perusteella */}
                        <input
                            className="search-input"
                            placeholder="Search by Last Name"
                            value={searchLastName}
                            onChange={(e) => setSearchLastName(e.target.value.toLowerCase())} // Tallentaa syötteen pienin kirjaimin
                        />
                        {/* Hakukenttä käyttäjätunnuksen perusteella */}
                        <input
                            className="search-input"
                            placeholder="Search by Username"
                            value={searchUserName}
                            onChange={(e) => setSearchUserName(e.target.value.toLowerCase())} // Tallentaa syötteen pienin kirjaimin
                        />
                        {/* Nappi suodattimien tyhjentämiseksi */}
                        <button className="clear-btn" onClick={clearFilters}>
                            Clear filters
                        </button>
                    </div>

                    {/* Käyttäjälistan taulukko */}
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
                                        // Muutetaan sukunimi ja käyttäjätunnus pieniksi kirjaimiksi hakua varten
                                        const lowerCaseLastName = u.lastName.toLowerCase()
                                        const lowerCaseUserName = u.userName.toLowerCase()
                                        // Suodatuslogiikka: näytetään, jos vastaa sukunimi- tai käyttäjätunnushakua
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
                                                        {/* Poistonappi */}
                                                        <button className="action-btn action-btn-delete" onClick={() => deleteUser(u)}>Delete</button>
                                                        {/* Muokkausnappi */}
                                                        <button className="action-btn action-btn-edit" onClick={() => editUser(u)}>Edit</button>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                        return null // Palautetaan null, jos käyttäjä ei täsmää hakuehtoihin
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
