import axios from "axios";

const baseUrl = "https://localhost:7234/api/addresses";

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

export default { setToken, create, getAll };
