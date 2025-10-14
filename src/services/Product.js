import axios from "axios";

const baseUrl = "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/products"

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


export default { getAll, getById, create, update, remove, setToken }