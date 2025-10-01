import axios from "axios";

const baseUrl = "https://localhost:7234/api/users"

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

const create = newUser => {
      const config = {
        headers: { Authorization: token },
    }
    return axios.post(baseUrl, newUser, config)
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
    return axios.put(`${baseUrl}/${object.userId}`, object, config)
}

const getById = (id) => {
  const config = {
    headers: { Authorization: token },
  };
  return axios.get(`${baseUrl}/${id}`, config).then(res => res.data);
};
const updatePassword = ({ userId, password }) => {
    const config = { headers: { Authorization: token } };
    return axios.put(`${baseUrl}/${userId}/password`, { password }, config);
}

export default { getAll, getById, create, remove, update, updatePassword, setToken}