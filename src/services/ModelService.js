import axios from 'axios';

const baseUrl = 'https://localhost:7234/api/models'; // backendin route modelille

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
