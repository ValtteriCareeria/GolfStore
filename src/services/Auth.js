import axios from "axios";

// Asetetaan perusosoite Axiosin käyttöä varten
const baseUrl = "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/authentication";

// Muutettu käyttämään Axiosia fetch-funktion sijaan
const authenticate = (userForAuth) => {
    // Axios tekee automaattisesti pyynnön ja palauttaa vastauksen.
    // .post(osoite, data)
    const request = axios.post(baseUrl, userForAuth);
    // Tässä palautetaan Axiosin vastaus suoraan
    return request.then(response => response);
};

export default { authenticate };
