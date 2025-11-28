import axios from "axios";

const baseUrl = "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/products"
//const baseUrl = "https://localhost:7234/api/products";

let token = null

// Tämä on metodi jota kutsutaan aina ennen kuin tehdään muu pyyntö serviceen
// Parametrina annetaan token joka otetaan local storagesta
const setToken = newToken => {
    token = `bearer ${newToken}`
}

const getAll = () => {
    const config = {
        headers: { Authorization: token },
    }
    const request = axios.get(baseUrl, config)
    return request.then(response => response.data)
}

const create = newProduct => {
    const config = {
        headers: { Authorization: token },
    }
    return axios.post(baseUrl, newProduct, config)
}

// HUOM! Käytä tätä poiston sijaan, kun käytät soft delete -logiikkaa backendissä!
const setSold = id => { 
    const config = {
        headers: { Authorization: token },
    }
    // Kutsutaan uutta setsold-päätepistettä, joka asettaa InventoryCount = 0
    return axios.put(`${baseUrl}/setsold/${id}`, null, config) 
}

const remove = id => {
    const config = {
        headers: { Authorization: token },
    }
    return axios.delete(`${baseUrl}/${id}`, config)
}

const update = (object) => {
    const config = {
        headers: { Authorization: token },
    }
    return axios.put(`${baseUrl}/${object.productId}`, object, config)
}

const getById = (id) => {
    const config = {
        headers: { Authorization: token },
    };
    return axios.get(`${baseUrl}/${id}`, config).then(response => response.data);
};


export default { getAll, getById, create, update, remove, setToken, setSold }