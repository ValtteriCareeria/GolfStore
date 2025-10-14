import axios from "axios";

const baseUrl = "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/addresses";

let token = null;

const setToken = newToken => {
  token = `Bearer ${newToken}`;
};

const create = async (address) => {
  const config = { headers: { Authorization: token } };
  return axios.post(baseUrl, address, config);
};

const getAll = async () => {
  const config = { headers: { Authorization: token } };
  const res = await axios.get(baseUrl, config);
  return res.data;
};
// Hae kaikki tietyn käyttäjän osoitteet
const getByUserId = async (userId) => {
  const config = { headers: { Authorization: token } };
  const res = await axios.get(`${baseUrl}/user/${userId}`, config);
  return res.data;
};

// Hae yksittäinen osoite ID:llä
const getById = async (id) => {
  const config = { headers: { Authorization: token } };
  const res = await axios.get(`${baseUrl}/${id}`, config);
  return res.data;
};

// Päivitä olemassa oleva osoite
const update = async (id, updatedAddress) => {
  const config = { headers: { Authorization: token } };
  const res = await axios.put(`${baseUrl}/${id}`, updatedAddress, config);
  return res.data;
};

// Poista osoite
const remove = async (id) => {
  const config = { headers: { Authorization: token } };
  const res = await axios.delete(`${baseUrl}/${id}`, config);
  return res.data;
};

export default { setToken, create, getAll, getByUserId, getById, update, remove };
