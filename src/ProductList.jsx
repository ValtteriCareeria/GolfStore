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
    const [products, setProducts] = useState([]); // Kaikki tuotteet
    const [brands, setBrands] = useState([]); // Kaikki brändit suodatukseen
    const [models, setModels] = useState([]); // Kaikki mallit suodatukseen

    // Tilat näkymien hallintaan
    const [lisäystila, setLisäystila] = useState(false); // Onko tuotteen lisäyslomake näkyvissä
    const [muokkaustila, setMuokkaustila] = useState(false); // Onko tuotteen muokkauslomake näkyvissä
    const [muokattavaProduct, setMuokattavaProduct] = useState(null); // Muokattava tuoteobjekti

    // Tilat suodatus- ja hakuehdoille
    const [search, setSearch] = useState(""); // Haku merkkijonolla (esim. nimellä)
    const [brandFilter, setBrandFilter] = useState(""); // Brändisuodattimen arvo
    const [modelFilter, setModelFilter] = useState(""); // Mallisuodattimen arvo
    const [priceSort, setPriceSort] = useState(""); // Hinnan lajittelusuunta ('asc'/'desc')
    const [reload, setReload] = useState(false); // Laukaisee uudelleenlatauksen (poisto/muokkaus)
    const [filteredProducts, setFilteredProducts] = useState([]); // Suodatetut ja järjestetyt tuotteet
    const [filteredModels, setFilteredModels] = useState([]); // Mallit, jotka kuuluvat valittuun brändiin
    const [visibleCount, setVisibleCount] = useState(8); // Näytettävien tuotteiden määrä (esim. "Lataa lisää")

    // Kirjautumistiedot ja oikeudet (haettu paikallisesta tallennustilasta)
    const loggedInUserId = parseInt(localStorage.getItem("userId")); // Kirjautuneen käyttäjän ID
    const accessLevelId = parseInt(localStorage.getItem("accessLevelId")); // Käyttöoikeustaso (esim. 1 = admin)
    const navigate = useNavigate(); // Navigointifunktio

    // **useEffect 1: Tuotteiden haku**
    // Suoritetaan, kun komponentti latautuu tai kun lisäys-/muokkaustila vaihtuu/reload laukeaa
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                ProductService.setToken(token); // Aseta token palveluun
                const data = await ProductService.getAll(); // Hae kaikki tuotteet
                setProducts(data); // Aseta tuotteet tilaan
            } catch (err) {
                console.error(err);
                setMessage('Tuotteiden lataaminen epäonnistui.');
                setIsPositive(false);
                setShowMessage(true);
            }
        };
        fetchProducts();
    }, [lisäystila, muokkaustila, reload]); // Riippuvuudet: lataa uudelleen, kun nämä tilat muuttuvat

    // **useEffect 2: Suodattimien (Brändit & Mallit) haku**
    // Suoritetaan kerran komponentin latautuessa
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const brandData = await BrandService.getAll(); // Hae kaikki brändit
                setBrands(brandData);

                const modelData = await ModelService.getAll(); // Hae kaikki mallit
                setModels(modelData);
            } catch (err) {
                console.error("Virhe haettaessa brandejä/malleja:", err);
            }
        };
        fetchFilters();
    }, []); // Tyhjä riippuvuuslista: suoritetaan vain kerran

    // **useEffect 3: Suodatus ja järjestyslogiikka**
    // Suoritetaan, kun tuotteet tai suodatus/järjestelytilat muuttuvat
    useEffect(() => {
        let filtered = [...products]; // Kopioi tuotteet

        // Haku nimellä
        if (search) {
            filtered = filtered.filter(p =>
                p.title?.toLowerCase().includes(search.toLowerCase())
            );
        }
        // Brändisuodatus (vertaa ID:tä)
        if (brandFilter) {
            filtered = filtered.filter(p => p.brand?.brandID === parseInt(brandFilter));
        }
        // Mallisuodatus (vertaa ID:tä)
        if (modelFilter) {
            filtered = filtered.filter(p => p.model?.modelID === parseInt(modelFilter));
        }
        // Hinnan järjestys
        if (priceSort === "asc") filtered.sort((a, b) => a.price - b.price); // Nouseva
        if (priceSort === "desc") filtered.sort((a, b) => b.price - a.price); // Laskeva

        setFilteredProducts(filtered); // Aseta suodatetut tuotteet tilaan
        setVisibleCount(8); // Nollaa näkyvien tuotteiden määrä suodatuksen jälkeen
    }, [products, search, brandFilter, modelFilter, priceSort]);

    // **useEffect 4: Mallisuodattimen päivittäminen brändin mukaan**
    // Suoritetaan, kun brändisuodatin tai mallilista muuttuu
    useEffect(() => {
        if (brandFilter) {
            // Näytetään vain valitun brändin mallit
            const relatedModels = models.filter(m => m.brand?.brandID === parseInt(brandFilter));
            setFilteredModels(relatedModels);
        } else {
            // Jos ei brändisuodatusta, näytetään kaikki mallit
            setFilteredModels(models);
        }

        // Tyhjennetään mallisuodatus, kun merkki vaihtuu
        setModelFilter("");
    }, [brandFilter, models]);

    // Käsittelijä: Avaa tuotteen lisäysnäkymän
    const handleAddNewClick = () => setLisäystila(true);
    // Käsittelijä: Asettaa muokattavan tuotteen ja avaa muokkausnäkymän
    const handleEditClick = (product) => { setMuokattavaProduct(product); setMuokkaustila(true); };

    // Käsittelijä: Tuotteen poisto
    const deleteProduct = (product) => {
        // Estä poisto, jos käyttäjällä ei ole oikeuksia (oma tuote tai admin)
        if (!(product.userId === loggedInUserId || accessLevelId === 1)) return;

        // Vahvistusikkuna (HUOM: parempi olisi käyttää kustomoitua modaalia)
        if (window.confirm(`Poista tuote ${product.title}?`)) {
            ProductService.remove(product.productId) // Poista tuote
                .then(() => {
                    setMessage(`Tuote ${product.title} poistettu onnistuneesti.`);
                    setIsPositive(true);
                    setShowMessage(true);
                    setReload(!reload); // Laukaisee tuotelistan uudelleenlatauksen
                })
                .catch(err => {
                    setMessage(`Poisto epäonnistui: ${err.message}`);
                    setIsPositive(false);
                    setShowMessage(true);
                });
        }
    };

    // Käsittelijä: Tuotteen lisääminen ostoskoriin
    const addToCart = (product) => {
        // Tarkista, onko tuote jo ostoskorissa
        const existingItem = cart.find(item => item.productId === product.productId);

        // Luo uusi ostoskori: lisää määrää, jos olemassa, tai lisää uutena
        const newCart = existingItem
            ? cart.map(item => item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item)
            : [...cart, { ...product, quantity: 1 }];

        setCart(newCart); // Päivitä React-tila
        localStorage.setItem("cart", JSON.stringify(newCart)); // Tallenna ostoskori localStorageen
        setMessage(`Tuote '${product.title}' lisätty ostoskoriin.`);
        setIsPositive(true);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 2000); // Piilota ilmoitus
    };

    // Käsittelijä: Tyhjentää kaikki suodattimet
    const clearFilters = () => {
        setSearch(""); setBrandFilter(""); setModelFilter(""); setPriceSort(""); setVisibleCount(8);
    };

    return (
        // Pääkontti
        <div >
            <div className="product-top-bar">
                <h1>Products</h1>
                {/* Suodatin- ja hakupalkki näkyy vain, jos ei olla lisäys/muokkaustilassa */}
                {!lisäystila && !muokkaustila && (
                    <>
                        {/* Haku nimellä */}
                        <input placeholder="Etsi Nimellä" value={search} onChange={e => setSearch(e.target.value)} />

                        {/* Brändisuodatin (dropdown) */}
                        <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
                            <option value="">Kaikki merkit</option>
                            {/* Kartoitetaan brändit option-elementeiksi */}
                            {brands.map(b => <option key={b.brandID} value={b.brandID}>{b.name}</option>)}
                        </select>

                        {/* Mallisuodatin (dropdown) */}
                        <select value={modelFilter} onChange={e => setModelFilter(e.target.value)}>
                            <option value="">Kaikki mallit</option>
                            {/* Kartoitetaan suodatetut mallit option-elementeiksi */}
                            {filteredModels.map(m => (
                                <option key={m.modelID} value={m.modelID}>{m.name}</option>
                            ))}
                        </select>

                        {/* Hinnan lajittelu (dropdown) */}
                        <select value={priceSort} onChange={e => setPriceSort(e.target.value)}>
                            <option value="">Järjestä hinnan mukaan</option>
                            <option value="asc">Pienin ensin</option>
                            <option value="desc">Suurin ensin</option>
                        </select>

                        {/* Painike suodattimien tyhjentämiseen */}
                        <button className="myproducts-btn" onClick={clearFilters}>Clear filters</button>
                        {/* Painike uuden tuotteen lisäämiseen */}
                        <button className="myproducts-btn" onClick={handleAddNewClick}>Lisää uusi</button>
                    </>
                )}
            </div>

            {/* Ehdollinen renderöinti: näytä lisäys- tai muokkausnäkymä, muuten tuotelista */}
            {lisäystila ? (
                // Tuotteen lisäyskomponentti
                <ProductAdd
                    setLisäystila={setLisäystila}
                    setIsPositive={setIsPositive}
                    setMessage={setMessage}
                    setShowMessage={setShowMessage}
                    onProductAdded={(newProduct) => setProducts([newProduct, ...products])}
                />
            ) : muokkaustila ? (
                // Tuotteen muokkauskomponentti
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
                        // Kartoitetaan suodatetut tuotteet (näytetään vain visibleCount verran)
                        filteredProducts.slice(0, visibleCount).map(p => (
                            <div key={p.productId} className="col-12 col-md-6 col-lg-3 mb-4">
                                <div className="product-item">
                                    <div className="product-image">
                                        {/* Tuotekuvan näyttö tai paikkamerkki */}
                                        {p.imageUrl
                                            ? <img src={p.imageUrl} alt={p.title} />
                                            : <div className="placeholder-icon">📦</div>}
                                    </div>
                                    {/* Tuotteen otsikko, klikkaamalla navigoidaan tuotesivulle */}
                                    <h3 onClick={() => navigate(`/products/${p.productId}`)} style={{ cursor: "pointer" }}>{p.title}</h3>
                                    <p><strong>Merkki:</strong> {p.brand?.name || '-'}</p>
                                    <p><strong>Malli:</strong> {p.model?.name || '-'}</p>
                                    <p><strong>Hinta:</strong> {p.price} €</p>

                                    {/* Myyjän tiedot (jos saatavilla) */}
                                    {p.seller && <div className="seller-info">
                                        <p><strong>Myyjä:</strong> {p.seller.firstName} {p.seller.lastName}</p>
                                    </div>}
                                    <div className="myproducts-buttons">
                                        {/* Painike lisätietoihin */}
                                        <button className="myproducts-btn" onClick={() => navigate(`/products/${p.productId}`)}>Lisätietoja</button>
                                        {/* Painike ostoskoriin lisäämiseen */}
                                        <button className="myproducts-btn" onClick={() => addToCart(p)}>Lisää ostoskoriin</button>
                                        {/* Muokkaus- ja poistopainikkeet näkyvät vain omistajalle tai adminille */}
                                        {(p.userId === loggedInUserId || accessLevelId === 1) && (
                                            <>
                                                <button className="myproducts-btn" onClick={() => handleEditClick(p)}>Muokkaa</button>
                                                <button className="myproducts-btn myproducts-btn-danger" onClick={() => deleteProduct(p)}>Poista</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : <p>Tuotteita ei löytynyt.</p>}

                    {/* Lataa lisää -painike näkyy, jos tuotteita on enemmän kuin näkyvissä */}
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
