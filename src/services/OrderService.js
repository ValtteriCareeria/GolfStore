import axios from "axios";

const baseUrl = "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/orders";
//const baseUrl = "https://localhost:7234/api/orders";

let token = null;

const setToken = newToken => {
    token = `Bearer ${newToken}`;
}

const getAll = () => {
    const config = { headers: { Authorization: token } };
    const request = axios.get(baseUrl, config);
    return request.then(response => response.data);
}

const create = (order) => {
    const config = { headers: { Authorization: token } };
    // Lähetetään vain ID:t ja muut tarvittavat kentät
    const payload = {
        buyerId: order.buyerId,
        paymentMethodId: order.paymentMethodId,
        deliveryOptionId: order.deliveryOptionId,
        addressId: order.addressId,
        orderDate: order.orderDate,
        status: order.status,
        totalAmount: order.totalAmount,
        orderItems: order.orderItems 
    };
    return axios.post(baseUrl, payload, config);
}

const update = object => {
    const config = { headers: { Authorization: token } };
    return axios.put(`${baseUrl}/${object.orderId}`, object, config);
}

const remove = id => {
    const config = { headers: { Authorization: token } };
    return axios.delete(`${baseUrl}/${id}`, config);
}

const getById = (id) => {
  const config = { headers: { Authorization: token } };
  return axios.get(`${baseUrl}/${id}`, config).then(res => res.data);
};

const getMyOrders = (userId) => {
    const config = { headers: { Authorization: token } };
    return axios
        .get(`${baseUrl}/myorders/${userId}`, config)
        .then(res => res.data);
};

export default { getAll, getById, getMyOrders, create, update, remove, setToken };
