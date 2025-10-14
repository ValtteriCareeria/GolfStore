import React, { useState, useEffect } from 'react';
import ProductService from './services/Product'; // Palvelu tuotteen päivitykseen
import BrandService from './services/BrandService'; // Palvelu brändien hakuun
import ModelService from './services/ModelService'; // Palvelu mallien hakuun
import './ProductEdit.css' // Komponentin tyylit
import NoAccessPopup from './NoAccessPopup'; // Popup-komponentti pääsykieltoa varten

// ProductEdit-komponentti tuotetietojen muokkaamiseen
const ProductEdit = ({
    setMuokkaustila, // Funktio muokkaustilan sulkemiseen
    muokattavaProduct, // Muokattava tuote (saapuu propseina ProductLististä)
    setIsPositive, // Funktio viestin värin asettamiseen
    setMessage, // Funktio viestin sisällön asettamiseen
    setShowMessage, // Funktio viestin näkyvyyden hallintaan
    onProductUpdated // Funktio tuotelistauksen päivittämiseen onnistuneen tallennuksen jälkeen
}) => {
    // Tila lomakkeen syötteitä varten, alustetaan muokattavan tuotteen tiedoilla
    const [product, setProduct] = useState({ ...muokattavaProduct });
    // Tilat käyttöoikeuksien ja popupin hallintaan
    const [hasPermission, setHasPermission] = useState(true);
    const [showPopup, setShowPopup] = useState(false);

    // Tilat brändi- ja mallidatalle
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [filteredModels, setFilteredModels] = useState([]); // Valitun brändin mukaiset mallit
    const [loading, setLoading] = useState(true); // Tilannekuva tietojen lataamisesta

    // **useEffect 1: Käyttöoikeuksien tarkistus**
    // Suoritetaan, kun muokattava tuote muuttuu.
    // Alustaa tuotteen tilan ja tarkistaa, onko käyttäjällä oikeus muokata tuotetta (oma tuote tai admin)
    useEffect(() => {
        setProduct({
            ...muokattavaProduct,
            BrandID: muokattavaProduct.brand?.brandID || '',
            ModelID: muokattavaProduct.model?.modelID || ''
        });

        const loggedInUserId = Number(localStorage.getItem('userId'));
        const accessLevelId = Number(localStorage.getItem('accessLevelId'));

        if (loggedInUserId !== muokattavaProduct.userId && accessLevelId !== 1) {
            setHasPermission(false);
            setShowPopup(true);
        }
    }, [muokattavaProduct]);

    // **useEffect 2: Brändien ja mallien haku**
    // Suoritetaan kerran komponentin latautuessa.
    // Hakee kaikki brändit ja mallit palveluista lomakkeen dropdown-valikoita varten.
    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandData = await BrandService.getAll();
                const modelData = await ModelService.getAll();
                setBrands(brandData || []);
                setModels(modelData || []);
                setLoading(false);
            } catch (err) {
                console.error("Virhe haettaessa brandejä/malleja:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // **useEffect 3: Mallien suodatus**
    // Suoritetaan, kun valittu BrandID tai mallilista muuttuu.
    // Suodattaa mallit, jotta näytetään vain valittuun brändiin kuuluvat mallit.
    useEffect(() => {
        if (product.BrandID) {
            const selectedBrandId = parseInt(product.BrandID);
            const filtered = models.filter(m => parseInt(m.brand?.brandID) === selectedBrandId);
            setFilteredModels(filtered);
        } else {
            setFilteredModels(models);
        }
    }, [product.BrandID, models]);

    // Käsittelijä lomakkeen syötekenttien muutoksille
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        // Jos brändi vaihtuu, nollaa samalla mallin valinta
        if (name === 'BrandID') {
            setProduct({ ...product, [name]: value, ModelID: '' });
        } else {
            setProduct({ ...product, [name]: value });
        }
    };

    // Lomakkeen lähetyskäsittelijä
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!hasPermission) return; // Estä lähetys, jos ei ole oikeuksia

        try {
            // Luodaan payload päivitystä varten
            const payload = {
                productId: product.productId,
                userId: product.userId,
                title: product.title,
                description: product.description,
                price: product.price,
                imageUrl: product.imageUrl,
                brandID: Number(product.BrandID) || null,
                modelID: Number(product.ModelID) || null
            };

            // Kutsutaan palvelua tuotteen päivittämiseksi
            await ProductService.update(payload);
            
            // Päivitetään tuotelista onnistuneesti
            onProductUpdated(payload);
            
            // Näytetään onnistumisviesti ja suljetaan muokkaustila
            setMessage('Tuote päivitetty onnistuneesti!');
            setIsPositive(true);
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 5000);
            setMuokkaustila(false);
        } catch (error) {
            // Käsittele virhe ja näytä virheviesti
            setMessage('Tuotteen päivitys epäonnistui.');
            setIsPositive(false);
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 6000);
            console.error(error);
        }
    };

    // Näytä latausilmoitus, kun tietoja haetaan
    if (loading) {
        return <div className="editpage-loading">Ladataan tietoja...</div>;
    }

    // Komponentin varsinainen renderöinti
    return (
        <div className="editpage-container">
            {/* Pääsykielto-popup (renderöidään ehdollisesti) */}
            {showPopup && (
                <NoAccessPopup
                    show={showPopup}
                    onClose={() => {
                        setShowPopup(false);
                        setMuokkaustila(false);
                    }}
                />
            )}

            {/* Muokkauslomake (renderöidään vain, jos on oikeudet) */}
            {hasPermission && (
                <>
                    <h2 className="editpage-title">Muokkaa tuotetta</h2>
                    <form onSubmit={handleSubmit} className="editpage-form">
                        
                        {/* Lomakkeen kentät: Nimi, Kuvaus, Hinta, Kuvan URL, Merkki, Malli */}
                        
                        <div className="editpage-form-group">
                            <label htmlFor="title">Tuotteen nimi</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={product.title || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="editpage-form-group">
                            <label htmlFor="description">Kuvaus</label>
                            <textarea
                                id="description"
                                name="description"
                                value={product.description || ''}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="editpage-form-group">
                            <label htmlFor="price">Hinta (€)</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={product.price || ''}
                                step="0.01"
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="editpage-form-group">
                            <label htmlFor="imageUrl">Kuvan URL</label>
                            <input
                                type="text"
                                id="imageUrl"
                                name="imageUrl"
                                value={product.imageUrl || ''}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="editpage-form-group">
                            <label htmlFor="brandId">Valitse merkki</label>
                            {/* Brändin valintalisto. Valinta päivittää suodatetut mallit */}
                            <select
                                id="BrandID"
                                name="BrandID"
                                value={product.BrandID || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Valitse merkki --</option>
                                {Array.isArray(brands) && brands.map(b => (
                                    <option key={b.brandID} value={b.brandID}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="editpage-form-group">
                            <label htmlFor="modelId">Mailan malli</label>
                            {/* Mallin valintalista. Sisältö riippuu valitusta brändistä */}
                            <select
                                id="ModelID"
                                name="ModelID"
                                value={product.ModelID || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Valitse malli --</option>
                                {Array.isArray(filteredModels) && filteredModels.map(m => (
                                    <option key={m.modelID} value={m.modelID}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tallenna ja Peruuta painikkeet */}
                        <div className="editpage-buttons">
                            <button type="submit" className="editpage-btn-save"> Tallenna</button>
                            <button
                                type="button"
                                className="editpage-btn-cancel"
                                onClick={() => setMuokkaustila(false)}
                            >
                                ✖ Peruuta
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default ProductEdit;
