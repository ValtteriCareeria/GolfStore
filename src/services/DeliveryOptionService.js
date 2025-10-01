import axios from "axios";

const baseUrl = "https://localhost:7234/api/deliveryOptions";

let token = null;

const setToken = newToken => {
    token = `Bearer ${newToken}`;
}

const getAll = () => {
    const config = { headers: { Authorization: token } };
    const request = axios.get(baseUrl, config);
    return request.then(response => response.data);
}

const create = newOption => {
    const config = { headers: { Authorization: token } };
    return axios.post(baseUrl, newOption, config);
}

const update = object => {
    const config = { headers: { Authorization: token } };
    return axios.put(`${baseUrl}/${object.deliveryOptionId}`, object, config);
}

const remove = id => {
    const config = { headers: { Authorization: token } };
    return axios.delete(`${baseUrl}/${id}`, config);
}

const getById = (id) => {
  const config = {
    headers: { Authorization: token },
  };
  const request = axios.get(`${baseUrl}/${id}`, config);
  return request.then(response => response.data);
};

export default { getAll, create, update, remove, getById, setToken };
