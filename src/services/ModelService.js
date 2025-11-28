import axios from 'axios';

const baseUrl = 'https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/models'; // backendin route modelille
//const baseUrl = "https://localhost:7234/api/models";

let token = null;

const setToken = newToken => {
  token = `Bearer ${newToken}`;
};

const getAll = async () => {
  const config = {
    headers: { Authorization: token }
  };
  const response = await axios.get(baseUrl, config);
  return response.data;
};

const create = async (newModel) => {
  const config = {
    headers: { Authorization: token }
  };
  const response = await axios.post(baseUrl, newModel, config);
  return response.data;
};

const remove = async (id) => {
  const config = {
    headers: { Authorization: token }
  };
  const response = await axios.delete(`${baseUrl}/${id}`, config);
  return response.data;
};

export default { getAll, create, remove, setToken };
