import axios from 'axios';

const baseUrl = 'https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/brands'; // backendin route brandille
//const baseUrl = "https://localhost:7234/api/brands";

let token = null;

const setToken = newToken => {
  token = `Bearer ${newToken}`;
};

const getAll = async () => {
  const config = {
    headers: { Authorization: token }
  };
  const response = await axios.get(baseUrl, config);
  return response.data; // ⬅️ palautetaan suoraan taulukko
};

const add = async (brand) => {
  const config = {
    headers: { Authorization: token }
  };
  const response = await axios.post(baseUrl, brand, config);
  return response.data; // palautetaan lisätty brand
};

const remove = async (id) => {
  const config = {
    headers: { Authorization: token }
  };
  const response = await axios.delete(`${baseUrl}/${id}`, config);
  return response.data; // palautetaan poiston viesti
};

export default { getAll, setToken, add, remove };
