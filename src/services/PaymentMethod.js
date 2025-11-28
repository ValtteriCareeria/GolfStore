import axios from "axios";

const baseUrl = "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/paymentMethods";
//const baseUrl = "https://localhost:7234/api/paymentMethods";

let token = null;

// Asetetaan token ennen kuin tehdään pyyntö
const setToken = newToken => {
    token = `Bearer ${newToken}`;
}

// Hakee kaikki maksutavat
const getAll = () => {
    const config = {
        headers: { Authorization: token },
    }
    const request = axios.get(baseUrl, config)
    return request.then(response => response.data)
}

// Lisää uuden maksutavan
const create = newMethod => {
    const config = {
        headers: { Authorization: token },
    }
    return axios.post(baseUrl, newMethod, config)
}

// Päivittää maksutavan
const update = (object) => {
    const config = {
        headers: { Authorization: token },
    }
    return axios.put(`${baseUrl}/${paymentMethodId}`, object, config)
}

// Poistaa maksutavan
const remove = id => {
    const config = {
        headers: { Authorization: token },
    }
    return axios.delete(`${baseUrl}/${id}`, config)
}
const getById = async (id) => {
  const config = { headers: { Authorization: token } };
  const response = await axios.get(`${baseUrl}/${id}`, config);
  return response.data;
};

export default { getAll, create, getById, update, remove, setToken };
