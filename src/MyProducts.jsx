import React, { useState, useEffect } from 'react';
import ProductService from './services/Product';
import ProductAdd from './ProductAdd';
import ProductEdit from './ProductEdit';
import { useNavigate } from "react-router-dom";
import './MyProducts.css';

const MyProducts = ({ setMessage, setIsPositive, setShowMessage }) => {
  // Komponentti käyttäjän omien tuotteiden listaamiseen ja hallintaan
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [lisäystila, setLisäystila] = useState(false);
  const [muokkaustila, setMuokkaustila] = useState(false);
  const [muokattavaProduct, setMuokattavaProduct] = useState(null);
  const [reload, setReload] = useState(false);

  const productsPerLoad = 9;
  const loggedInUserId = parseInt(localStorage.getItem("userId"));
  const accessLevelId = parseInt(localStorage.getItem("accessLevelId"));
  const navigate = useNavigate();

  // **useEffect: Tuotteiden haku**
  // Suoritetaan komponentin latautuessa ja kun tila muuttuu (lisäys/muokkaus/poisto)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Asetetaan token palveluun
        const token = localStorage.getItem('token');
        ProductService.setToken(token);
        // Haetaan kaikki tuotteet
        const data = await ProductService.getAll();
        // Suodatetaan vain sisäänkirjautuneen käyttäjän omat tuotteet
        const userProducts = data.filter(p => p.userId === loggedInUserId);
        setProducts(userProducts);
        // Näytetään aluksi vain ensimmäinen erä (productsPerLoad)
        setVisibleProducts(userProducts.slice(0, productsPerLoad));
      } catch (err) {
        // Virheen sattuessa näytetään ilmoitus
        console.error("Virhe tuotteiden haussa:", err);
        setMessage("Tuotteiden lataaminen epäonnistui.");
        setIsPositive(false);
        setShowMessage(true);
      }
    };
    fetchProducts();
  }, [lisäystila, muokkaustila, reload, loggedInUserId]); // Riippuvuudet, jotka laukaisevat uudelleenlatauksen

  // Käsittelijä muokkauspainikkeen painallukselle
  const handleEditClick = (product) => {
    setMuokattavaProduct(product); // Asetetaan muokattava tuote
    setMuokkaustila(true); // Vaihdetaan muokkaustilaan
  };

  // Käsittelijä tuotteen poistamiselle
  const deleteProduct = (product) => {
    // Estetään poisto, jos käyttäjällä ei ole oikeuksia (omistaja tai admin)
    if (!(product.userId === loggedInUserId || accessLevelId === 1)) return;

    // Vahvistusdialogi
    if (window.confirm(`Poista tuote ${product.title}?`)) {
      ProductService.remove(product.productId)
        .then(() => {
          // Onnistunut poisto: näytetään viesti ja laukaistaan uudelleenlataus
          setMessage(`Tuote ${product.title} poistettu onnistuneesti.`);
          setIsPositive(true);
          setShowMessage(true);
          setReload(!reload);
        })
        .catch(err => {
          // Epäonnistunut poisto: näytetään virheilmoitus
          setMessage(`Tuotteen poisto epäonnistui: ${err.message}`);
          setIsPositive(false);
          setShowMessage(true);
        });
    }
  };

  // Funktio, joka lataa lisää tuotteita näkyviin (infinite scroll/lataa lisää -toiminto)
  const loadMore = () => {
    const currentLength = visibleProducts.length;
    // Otetaan seuraavat tuotteet
    const nextProducts = products.slice(currentLength, currentLength + productsPerLoad);
    // Lisätään uudet tuotteet olemassa olevien perään
    setVisibleProducts([...visibleProducts, ...nextProducts]);
  };

  // **Ehdollinen renderöinti: Lisäystila**
  if (lisäystila) {
    return (
      <ProductAdd
        setLisäystila={setLisäystila}
        setIsPositive={setIsPositive}
        setMessage={setMessage}
        setShowMessage={setShowMessage}
        // Päivitetään tuotelista heti uuden tuotteen lisäämisen jälkeen
        onProductAdded={(newProduct) => setProducts([newProduct, ...products])}
      />
    );
  }

  // **Ehdollinen renderöinti: Muokkaustila**
  if (muokkaustila) {
    return (
      <ProductEdit
        setMuokkaustila={setMuokkaustila}
        muokattavaProduct={muokattavaProduct}
        setIsPositive={setIsPositive}
        setMessage={setMessage}
        setShowMessage={setShowMessage}
        // Päivitetään tuotelista heti tuotteen muokkaamisen jälkeen
        onProductUpdated={(updatedProduct) =>
          setProducts(products.map(p => p.productId === updatedProduct.productId ? updatedProduct : p))
        }
      />
    );
  }

  // **Päärenderöinti: Tuotelista**
  return (
    <div className="myproducts-wrapper">
      <div className="myproducts-header">
        <h1 className="myproducts-title">Omat tuotteet</h1>
        <div className="myproducts-header-buttons">
          <button className="myproducts-btn myproducts-btn-back" onClick={() => navigate(-1)}>Takaisin</button>
          <button className="myproducts-btn myproducts-btn-add" onClick={() => setLisäystila(true)}>Lisää uusi</button>
        </div>
      </div>

      <div className="myproducts-list row">
        {/* Näytetään ilmoitus, jos tuotteita ei ole */}
        {visibleProducts.length === 0 && <p className="myproducts-empty">Sinulla ei ole vielä lisättyjä tuotteita.</p>}

        {/* Listataan näkyvät tuotteet korteissa */}
        {visibleProducts.map((p) => (
          <div key={p.productId} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="myproducts-card">
              <h3
                className="myproducts-card-title"
                // Navigoi tuotesivulle otsikkoa klikkaamalla
                onClick={() => navigate(`/products/${p.productId}`)}
              >
                {p.title}
              </h3>

              <p><strong>Merkki:</strong> {p.brand?.name || '-'} {p.brandID ? ` (ID: ${p.brandID})` : ""}</p>
              <p><strong>Malli:</strong> {p.model?.name || '-'}</p>
              <p><strong>Hinta:</strong> {p.price} €</p>
              <p className="myproducts-description">{p.description}</p>

              <div className="myproducts-buttons">
                <button className="myproducts-btn" onClick={() => navigate(`/products/${p.productId}`)}>
                  Lisätietoja
                </button>

                {/* Muokkaa/Poista-painikkeet näytetään vain tuotteen omistajalle tai adminille */}
                {(p.userId === loggedInUserId || accessLevelId === 1) && (
                  <>
                    <button className="myproducts-btn" onClick={() => handleEditClick(p)}>
                      Muokkaa
                    </button>
                    <button className="myproducts-btn myproducts-btn-danger" onClick={() => deleteProduct(p)}>
                      Poista
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lataa lisää -painike näytetään, jos tuotteita on vielä lataamatta */}
      {visibleProducts.length < products.length && (
        <div className="myproducts-pagination">
          <button className="myproducts-btn" onClick={loadMore}>
            Lataa lisää
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
