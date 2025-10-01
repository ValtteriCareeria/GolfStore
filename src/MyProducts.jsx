import React, { useState, useEffect } from 'react';
import ProductService from './services/Product';
import ProductAdd from './ProductAdd';
import ProductEdit from './ProductEdit';
import { useNavigate } from "react-router-dom";
import './MyProducts.css'; // uusi tyyli

const MyProducts = ({ setMessage, setIsPositive, setShowMessage }) => {
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        ProductService.setToken(token);
        const data = await ProductService.getAll();
        const userProducts = data.filter(p => p.userId === loggedInUserId);
        setProducts(userProducts);
        setVisibleProducts(userProducts.slice(0, productsPerLoad));
      } catch (err) {
        console.error("Virhe tuotteiden haussa:", err);
        setMessage("Tuotteiden lataaminen epäonnistui.");
        setIsPositive(false);
        setShowMessage(true);
      }
    };
    fetchProducts();
  }, [lisäystila, muokkaustila, reload, loggedInUserId]);

  const handleEditClick = (product) => {
    setMuokattavaProduct(product);
    setMuokkaustila(true);
  };

  const deleteProduct = (product) => {
    if (!(product.userId === loggedInUserId || accessLevelId === 1)) return;

    if (window.confirm(`Poista tuote ${product.title}?`)) {
      ProductService.remove(product.productId)
        .then(() => {
          setMessage(`Tuote ${product.title} poistettu onnistuneesti.`);
          setIsPositive(true);
          setShowMessage(true);
          setReload(!reload);
        })
        .catch(err => {
          setMessage(`Tuotteen poisto epäonnistui: ${err.message}`);
          setIsPositive(false);
          setShowMessage(true);
        });
    }
  };

  const loadMore = () => {
    const currentLength = visibleProducts.length;
    const nextProducts = products.slice(currentLength, currentLength + productsPerLoad);
    setVisibleProducts([...visibleProducts, ...nextProducts]);
  };

  if (lisäystila) {
    return (
      <ProductAdd
        setLisäystila={setLisäystila}
        setIsPositive={setIsPositive}
        setMessage={setMessage}
        setShowMessage={setShowMessage}
        onProductAdded={(newProduct) => setProducts([newProduct, ...products])}
      />
    );
  }

  if (muokkaustila) {
    return (
      <ProductEdit
        setMuokkaustila={setMuokkaustila}
        muokattavaProduct={muokattavaProduct}
        setIsPositive={setIsPositive}
        setMessage={setMessage}
        setShowMessage={setShowMessage}
        onProductUpdated={(updatedProduct) =>
          setProducts(products.map(p => p.productId === updatedProduct.productId ? updatedProduct : p))
        }
      />
    );
  }

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
        {visibleProducts.length === 0 && <p className="myproducts-empty">Sinulla ei ole vielä lisättyjä tuotteita.</p>}

        {visibleProducts.map((p) => (
          <div key={p.productId} className="col-12 col-md-6 col-lg-4 mb-4">
            <div className="myproducts-card">
              <h3
                className="myproducts-card-title"
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
