import React, { useState, useEffect } from 'react';
import ProductService from './services/Product'; // Palvelu tuotetietojen hakuun ja käsittelyyn
import BrandService from './services/BrandService'; // Palvelu bränditietojen hakuun
import ModelService from './services/ModelService'; // Palvelu mallitietojen hakuun
import ProductAdd from './ProductAdd'; // Tuotteen lisäyskomponentti
import ProductEdit from './ProductEdit'; // Tuotteen muokkauskomponentti
import { useNavigate } from "react-router-dom"; // Hook reititykseen
import './ProductList.css'; // Komponentin tyylitiedosto

// ProductList-komponentti, joka näyttää tuotteet ja suodatus/järjestelytoiminnot
const ProductList = ({ cart, setCart, setMessage, setIsPositive, setShowMessage }) => {
    // Tilat tuotedatalle ja suodattimille
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);

    // Tilat näkymien hallintaan
    const [lisäystila, setLisäystila] = useState(false);
    const [muokkaustila, setMuokkaustila] = useState(false);
    const [muokattavaProduct, setMuokattavaProduct] = useState(null);

    // Tilat suodatus- ja hakuehdoille
    const [search, setSearch] = useState("");
    const [brandFilter, setBrandFilter] = useState("");
    const [modelFilter, setModelFilter] = useState("");
    const [priceSort, setPriceSort] = useState("");
    const [reload, setReload] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filteredModels, setFilteredModels] = useState([]);
    const [visibleCount, setVisibleCount] = useState(8);

    // Kirjautumistiedot ja oikeudet (haettu paikallisesta tallennustilasta)
    const loggedInUserId = parseInt(localStorage.getItem("userId"));
    const accessLevelId = parseInt(localStorage.getItem("accessLevelId"));
    const navigate = useNavigate();

    // **useEffect 1: Tuotteiden haku**
    // HUOM: Backend suodattaa nyt automaattisesti ne, joiden InventoryCount = 0.
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                ProductService.setToken(token); 
                const data = await ProductService.getAll(); // Hakee vain aktiiviset tuotteet (InventoryCount > 0)
                setProducts(data);
            } catch (err) {
                console.error(err);
                setMessage('Tuotteiden lataaminen epäonnistui.');
                setIsPositive(false);
                setShowMessage(true);
            }
        };
        fetchProducts();
    }, [lisäystila, muokkaustila, reload]);

    // **useEffect 2: Suodattimien (Brändit & Mallit) haku** (Ei muutoksia)
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const brandData = await BrandService.getAll();
                setBrands(brandData);

                const modelData = await ModelService.getAll();
                setModels(modelData);
            } catch (err) {
                console.error("Virhe haettaessa brandejä/malleja:", err);
            }
        };
        fetchFilters();
    }, []);

    // **useEffect 3: Suodatus ja järjestyslogiikka** (Ei muutoksia)
    useEffect(() => {
        let filtered = [...products];

        // Haku nimellä
        if (search) {
            filtered = filtered.filter(p =>
                p.title?.toLowerCase().includes(search.toLowerCase())
            );
        }
        // Brändisuodatus
        if (brandFilter) {
            filtered = filtered.filter(p => p.brand?.brandID === parseInt(brandFilter));
        }
        // Mallisuodatus
        if (modelFilter) {
            filtered = filtered.filter(p => p.model?.modelID === parseInt(modelFilter));
        }
        // Hinnan järjestys
        if (priceSort === "asc") filtered.sort((a, b) => a.price - b.price);
        if (priceSort === "desc") filtered.sort((a, b) => b.price - a.price);

        setFilteredProducts(filtered);
        setVisibleCount(8);
    }, [products, search, brandFilter, modelFilter, priceSort]);

    // **useEffect 4: Mallisuodattimen päivittäminen brändin mukaan** (Ei muutoksia)
    useEffect(() => {
        if (brandFilter) {
            const relatedModels = models.filter(m => m.brand?.brandID === parseInt(brandFilter));
            setFilteredModels(relatedModels);
        } else {
            setFilteredModels(models);
        }
        setModelFilter("");
    }, [brandFilter, models]);

    // Käsittelijä: Avaa tuotteen lisäysnäkymän
    const handleAddNewClick = () => setLisäystila(true);
    // Käsittelijä: Asettaa muokattavan tuotteen ja avaa muokkausnäkymän
    const handleEditClick = (product) => { setMuokattavaProduct(product); setMuokkaustila(true); };

    // Käsittelijä: Tuotteen piilotus (pehmeä poisto)
    const setProductSold = (product) => {
        // Estä piilotus, jos käyttäjällä ei ole oikeuksia (oma tuote tai admin)
        if (!(product.userId === loggedInUserId || accessLevelId === 1)) return;

        // Kysytään vahvistus piilotukselle (myymiseksi)
        if (window.confirm(`Merkitäänkö tuote ${product.title} myydyksi? Se poistuu listalta, mutta säilyy tietokannassa.`)) {
            // KUTSUTAAN UUTTA SETSOLD-METODIA
            ProductService.setSold(product.productId)
                .then(() => {
                    setMessage(`Tuote ${product.title} merkittiin myydyksi ja piilotettiin listauksesta.`);
                    setIsPositive(true);
                    setShowMessage(true);
                    setReload(!reload); // Laukaisee tuotelistan uudelleenlatauksen (joka hakee nyt suodatetun listan)
                })
                .catch(err => {
                    // Huom: Backendin DbUpdateExceptionin takia DELETE-kutsun virheviestit ovat todennäköisesti olleet vaikeampia
                    setMessage(`Toimenpide epäonnistui: ${err.message}.`);
                    setIsPositive(false);
                    setShowMessage(true);
                });
        }
    };

    // HUOM: Vanha deleteProduct-metodi (fyysinen poisto) säilytetty vertailun vuoksi, mutta yllä olevaa setProductSold-metodia suositellaan.
    const deleteProduct = (product) => {
        if (!(product.userId === loggedInUserId || accessLevelId === 1)) return;

        if (window.confirm(`Poista tuote ${product.title} FYYSISESTI (ei suositella)?`)) {
            ProductService.remove(product.productId) // Fyysinen poisto
                .then(() => {
                    setMessage(`Tuote ${product.title} poistettu onnistuneesti.`);
                    setIsPositive(true);
                    setShowMessage(true);
                    setReload(!reload);
                })
                .catch(err => {
                    setMessage(`Poisto epäonnistui (Viite-eheysrikkomus?): ${err.response.data?.message || err.message}`);
                    setIsPositive(false);
                    setShowMessage(true);
                });
        }
    };

    // Käsittelijä: Tuotteen lisääminen ostoskoriin (Ei muutoksia)
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.productId === product.productId);

        const newCart = existingItem
            ? cart.map(item => item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item)
            : [...cart, { ...product, quantity: 1 }];

        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
        setMessage(`Tuote '${product.title}' lisätty ostoskoriin.`);
        setIsPositive(true);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2000);
    };

    // Käsittelijä: Tyhjentää kaikki suodattimet (Ei muutoksia)
    const clearFilters = () => {
        setSearch(""); setBrandFilter(""); setModelFilter(""); setPriceSort(""); setVisibleCount(8);
    };

    return (
        <div>
            <div className="product-top-bar">
                <h1>Products</h1>
                {/* Suodatin- ja hakupalkki */}
                {!lisäystila && !muokkaustila && (
                    <>
                        <input placeholder="Etsi Nimellä" value={search} onChange={e => setSearch(e.target.value)} />
                        <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
                            <option value="">Kaikki merkit</option>
                            {brands.map(b => <option key={b.brandID} value={b.brandID}>{b.name}</option>)}
                        </select>
                        <select value={modelFilter} onChange={e => setModelFilter(e.target.value)}>
                            <option value="">Kaikki mallit</option>
                            {filteredModels.map(m => (
                                <option key={m.modelID} value={m.modelID}>{m.name}</option>
                            ))}
                        </select>
                        <select value={priceSort} onChange={e => setPriceSort(e.target.value)}>
                            <option value="">Järjestä hinnan mukaan</option>
                            <option value="asc">Pienin ensin</option>
                            <option value="desc">Suurin ensin</option>
                        </select>
                        <button className="myproducts-btn" onClick={clearFilters}>Clear filters</button>
                        <button className="myproducts-btn" onClick={handleAddNewClick}>Lisää uusi</button>
                    </>
                )}
            </div>

            {/* Ehdollinen renderöinti */}
            {lisäystila ? (
                <ProductAdd
                    setLisäystila={setLisäystila}
                    setIsPositive={setIsPositive}
                    setMessage={setMessage}
                    setShowMessage={setShowMessage}
                    onProductAdded={(newProduct) => setProducts([newProduct, ...products])}
                />
            ) : muokkaustila ? (
                <ProductEdit
                    setMuokkaustila={setMuokkaustila}
                    muokattavaProduct={muokattavaProduct}
                    setIsPositive={setIsPositive}
                    setMessage={setMessage}
                    setShowMessage={setShowMessage}
                    onProductUpdated={(updatedProduct) => setProducts(products.map(p => p.productId === updatedProduct.productId ? updatedProduct : p))}
                />
            ) : (
                // **Tuotelistaus-grid**
                <div className="row">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.slice(0, visibleCount).map(p => (
                            <div key={p.productId} className="col-12 col-md-6 col-lg-3 mb-4">
                                <div className="product-item">
                                    <div className="product-image">
                                        {p.imageUrl
                                            ? <img src={p.imageUrl} alt={p.title} />
                                            : <div className="placeholder-icon">📦</div>}
                                    </div>
                                    <h3 onClick={() => navigate(`/products/${p.productId}`)} style={{ cursor: "pointer" }}>{p.title}</h3>
                                    <p><strong>Merkki:</strong> {p.brand?.name || '-'}</p>
                                    <p><strong>Malli:</strong> {p.model?.name || '-'}</p>
                                    <p><strong>Hinta:</strong> {p.price} €</p>
                                    {/* LISÄYS TÄHÄN: InventoryCount näkyviin */}
                                    <p style={{ fontWeight: 'bold', color: p.inventoryCount === 0 ? 'red' : 'green' }}>
                                        Varastosaldo: {p.inventoryCount} kpl
                                    </p>
                                    {p.seller && <div className="seller-info">
                                        <p><strong>Myyjä:</strong> {p.seller.firstName} {p.seller.lastName}</p>
                                    </div>}
                                    <div className="myproducts-buttons">
                                        <button className="myproducts-btn" onClick={() => navigate(`/products/${p.productId}`)}>Lisätietoja</button>
                                        <button className="myproducts-btn" onClick={() => addToCart(p)}>Lisää ostoskoriin</button>
                                        {/* Muokkaus ja PIILOTUS (pehmeä poisto) */}
                                        {(p.userId === loggedInUserId || accessLevelId === 1) && (
                                            <>
                                                <button className="myproducts-btn" onClick={() => handleEditClick(p)}>Muokkaa</button>
                                                {/* KORVAA TÄMÄ deleteProduct -> setProductSold */}
                                                <button className="myproducts-btn myproducts-btn-danger" onClick={() => setProductSold(p)}>Merkitse myydyksi (Piilota)</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : <p>Tuotteita ei löytynyt.</p>}

                    {/* Lataa lisää -painike */}
                    {!lisäystila && !muokkaustila && filteredProducts.length > visibleCount && (
                        <div className="load-more">
                            <button className="myproducts-btn" onClick={() => setVisibleCount(prev => prev + 8)}>Lataa lisää</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductList;
