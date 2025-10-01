import axios from "axios";

// Asetetaan perusosoite Axiosin käyttöä varten
const baseUrl = "https://localhost:7234/api/authentication";

// Muutettu käyttämään Axiosia fetch-funktion sijaan
const authenticate = (userForAuth) => {
    // Axios tekee automaattisesti pyynnön ja palauttaa vastauksen.
    // .post(osoite, data)
    const request = axios.post(baseUrl, userForAuth);
    // Tässä palautetaan Axiosin vastaus suoraan
    return request.then(response => response);
};

export default { authenticate };