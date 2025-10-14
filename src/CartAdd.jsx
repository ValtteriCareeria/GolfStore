import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import paymentMethodService from "./services/PaymentMethod";
import deliveryOptionService from "./services/DeliveryOptionService";
import orderService from "./services/OrderService";
import addressService from "./services/AddressService";
import "./CartAdd.css";

const CartAdd = ({ cart, setCart, setMessage, setIsPositive, setShowMessage }) => {
  // Toimitus- ja maksutapojen tilat
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Osoitekenttien tilat (käytetään uuden osoitteen syöttämiseen)
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  
  // Valitut vaihtoehdot
  const [deliveryOptionId, setDeliveryOptionId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  
  // Oletusosoitteen ja sen käyttöön liittyvät tilat
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);

  const navigate = useNavigate();
  // Haetaan käyttäjä-ID localStorage-muistista
  const userId = parseInt(localStorage.getItem("userId"));

  // useEffect: Hakee maksutavat, toimitustavat ja käyttäjän oletusosoitteen
  useEffect(() => {
    // Asetetaan todennus-tokenit kaikille palveluille
    const token = localStorage.getItem("token");
    if (token) {
      paymentMethodService.setToken(token);
      deliveryOptionService.setToken(token);
      addressService.setToken(token);
    }

    const fetchOptions = async () => {
      try {
        // 1. Haetaan toimitustavat
        const deliveries = await deliveryOptionService.getAll();
        setDeliveryOptions(deliveries);

        // 2. Haetaan maksutavat
        const payments = await paymentMethodService.getAll();
        setPaymentMethods(payments);

        // 3. Hae käyttäjän osoitteet ja etsi oletusosoite (isDefault: true)
        const addresses = await addressService.getByUserId(userId);
        const defaultAddr = addresses.find(a => a.isDefault);
        setDefaultAddress(defaultAddr || null);

        // 4. Jos oletusosoite löytyy ja sen käyttö on valittu, täytä osoitekentät oletusarvoilla.
        if (defaultAddr && useDefaultAddress) {
          setStreetAddress(defaultAddr.streetAddress);
          setCity(defaultAddr.city);
          setPostalCode(defaultAddr.postalCode);
          setCountry(defaultAddr.country);
        } else if (defaultAddr && !useDefaultAddress) {
           // Jos valittu, ettei käytetä oletusta, tyhjennetään kentät uuden osoitteen syöttöä varten
           setStreetAddress("");
           setCity("");
           setPostalCode("");
           setCountry("");
        }

        // 5. Jos käyttäjällä ei ole osoitetta, pakotetaan uuden osoitteen syöttö (käyttöliittymä on jo asettanut kentät auki).
        if (!defaultAddr) setUseDefaultAddress(false);

      } catch (err) {
        console.error("Virhe vaihtoehtojen tai osoitteiden latauksessa", err);
      }
    };

    fetchOptions();
    // Päivitetään, jos userId tai useDefaultAddress muuttuu
  }, [userId, useDefaultAddress]); 

  // handleSubmit: Vahvistaa ja luo tilauksen
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    orderService.setToken(token);
    addressService.setToken(token);

    try {
      let addressId;

      // --- Osoitteen käsittely: Uusi osoite vs. oletusosoite ---
      if (useDefaultAddress && defaultAddress) {
        // Käytetään olemassa olevaa oletusosoitetta.
        addressId = defaultAddress.addressId;
      } else {
        // Luo uusi osoite:
        const addressData = {
          userId,
          streetAddress,
          city,
          postalCode,
          country,
          // Asetetaan isDefault: true, jos käyttäjällä ei ollut vanhaa osoitetta.
          isDefault: !defaultAddress 
        };
        const addressResponse = await addressService.create(addressData);
        addressId = addressResponse.addressId || addressResponse.data?.addressId;
        if (!addressId) throw new Error("Osoitteen luonti epäonnistui");
      }

      // --- Hintalaskenta ---
      const selectedDelivery = deliveryOptions.find(d => d.deliveryOptionId === parseInt(deliveryOptionId));
      const deliveryCost = selectedDelivery ? selectedDelivery.cost : 0;
      const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const totalAmount = itemsTotal + deliveryCost;

      // --- Tilauksen luonti (OrderData) ---
      const orderData = {
        buyerId: userId,
        paymentMethodId: parseInt(paymentMethodId),
        deliveryOptionId: parseInt(deliveryOptionId),
        addressId, // Käytetään valittua/luotua osoitetta
        orderDate: new Date().toISOString(),
        status: "Pending", // Tilaus odottaa käsittelyä
        totalAmount,
        // Muodostetaan tilausrivit (OrderItems) ostoskorin sisällöstä
        orderItems: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.price // Tallennetaan hinta ostohetkellä
        }))
      };

      // Lähetetään tilaus
      await orderService.create(orderData);
      
      // Tyhjennetään ostoskori ja paikallinen tallennustila (localStorage)
      setCart([]);
      localStorage.removeItem("cart");

      // Näytetään onnistumisviesti ja navigoidaan
      setMessage?.("Tilaus onnistui!");
      setIsPositive?.(true);
      setShowMessage?.(true);

      navigate("/myorders");
    } catch (err) {
      // Virheen käsittely
      console.error("Virhe tilauksen luonnissa:", err.response?.data || err);
      setMessage?.("Virhe tilauksen luonnissa");
      setIsPositive?.(false);
      setShowMessage?.(true);
    }
  };

  // Jos ostoskori on tyhjä, näytetään viesti
  if (!cart || cart.length === 0) return <p>Ostoskori on tyhjä.</p>;

  return (
    <div className="cartadd-container">
      <h2 className="cartadd-title">Tee tilaus</h2>
      <div className="cartadd-grid">
        {/* Ostoskorin yhteenveto */}
        <div className="cart-summary">
          <h3>Ostoskori</h3>
          <ul>
            {cart.map(item => (
              <li key={item.productId}>
                {item.title} - {item.quantity} kpl - {item.price.toFixed(2)} €/kpl
              </li>
            ))}
          </ul>
          {/* Lasketaan ja näytetään loppusumma. Täsmälleen sama laskentalogiikka kuin handleSubmit-funktiossa. */}
          {(() => {
            const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const selectedDelivery = deliveryOptions.find(d => d.deliveryOptionId === parseInt(deliveryOptionId));
            const deliveryCost = selectedDelivery ? selectedDelivery.cost : 0;
            const totalAmount = itemsTotal + deliveryCost;
            return (
              <p className="cart-total">
                <strong>Yhteensä:</strong> {itemsTotal.toFixed(2)} € + toimitus {deliveryCost} € = {totalAmount.toFixed(2)} €
              </p>
            );
          })()}
        </div>

        {/* Tilauslomake */}
        <form className="order-form" onSubmit={handleSubmit}>
          <h3>Osoitetiedot</h3>

          {/* Oletusosoitteen valintaboksi, näkyy vain jos oletusosoite löytyy */}
          {defaultAddress && (
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={useDefaultAddress}
                  onChange={e => setUseDefaultAddress(e.target.checked)}
                />
                Käytä oletusosoitetta
              </label>
              <button
                type="button"
                className="btn-submit"
                onClick={() => navigate(`/editaddress/${defaultAddress.addressId}`, { state: { from: "/order" } })}
              >
                Muokkaa oletusosoitetta
              </button>
            </div>
          )}

          {/* Osoitekentät. Kentät on disabloitu (disabled) jos useDefaultAddress on tosi. */}
          <input
            type="text"
            placeholder="Katuosoite"
            value={streetAddress}
            onChange={e => setStreetAddress(e.target.value)}
            required
            disabled={useDefaultAddress}
          />
          <input
            type="text"
            placeholder="Kaupunki"
            value={city}
            onChange={e => setCity(e.target.value)}
            required
            disabled={useDefaultAddress}
          />
          <input
            type="text"
            placeholder="Postinumero"
            value={postalCode}
            onChange={e => setPostalCode(e.target.value)}
            required
            disabled={useDefaultAddress}
          />
          <input
            type="text"
            placeholder="Maa"
            value={country}
            onChange={e => setCountry(e.target.value)}
            required
            disabled={useDefaultAddress}
          />

          <h3>Toimitustapa</h3>
          {/* Toimitustapojen pudotusvalikko. deliveryOptions-listan dataa käytetään */}
          <select value={deliveryOptionId} onChange={e => setDeliveryOptionId(e.target.value)} required>
            <option value="">Valitse toimitustapa</option>
            {deliveryOptions.map(d => (
              <option key={d.deliveryOptionId} value={d.deliveryOptionId}>{d.name} - {d.cost} €</option>
            ))}
          </select>

          <h3>Maksutapa</h3>
          {/* Maksutapojen pudotusvalikko. paymentMethods-listan dataa käytetään */}
          <select value={paymentMethodId} onChange={e => setPaymentMethodId(e.target.value)} required>
            <option value="">Valitse maksutapa</option>
            {paymentMethods.map(p => (
              <option key={p.paymentMethodId} value={p.paymentMethodId}>{p.name}</option>
            ))}
          </select>

          <button type="submit" className="submit-btn">Vahvista tilaus</button>
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>Takaisin</button>
        </form>
      </div>
    </div>
  );
};

export default CartAdd;
