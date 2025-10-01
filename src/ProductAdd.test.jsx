import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ProductAdd from "./ProductAdd";
import ProductService from "./services/Product";
import BrandService from "./services/BrandService";
import ModelService from "./services/ModelService";

// Mock-palvelut
vi.mock("./services/Product", () => ({
  __esModule: true,
  default: { setToken: vi.fn(), create: vi.fn() }
}));
vi.mock("./services/BrandService", () => ({
  __esModule: true,
  default: { getAll: vi.fn() }
}));
vi.mock("./services/ModelService", () => ({
  __esModule: true,
  default: { getAll: vi.fn() }
}));

// Mock-data on nyt golf-aiheinen
const mockBrands = [
  { brandID: 1, name: "Titleist" },
  { brandID: 2, name: "Callaway" },
];
const mockModels = [
  // Titleist (brandID: 1)
  { modelID: 101, name: "T100 Irons", brand: { brandID: 1 } },
  { modelID: 102, name: "Vokey SM9", brand: { brandID: 1 } },
  // Callaway (brandID: 2)
  { modelID: 201, name: "Rogue ST Driver", brand: { brandID: 2 } },
];

describe("ProductAdd component", () => {
  const setLisäystila = vi.fn();
  const setIsPositive = vi.fn();
  const setMessage = vi.fn();
  const setShowMessage = vi.fn();
  const onProductAdded = vi.fn();
  const mockCreatedProduct = { title: "Titleist T100 Irons Set", productId: 99 }; // Päivitetty tuotenimi

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Palvelut palauttavat mock-datan
    BrandService.getAll.mockResolvedValue(mockBrands);
    ModelService.getAll.mockResolvedValue(mockModels);
    ProductService.create.mockResolvedValue({ data: mockCreatedProduct });
    
    // Asetetaan sisäänkirjautunut käyttäjä
    localStorage.setItem('userId', '1');
  });

  const renderComponent = () => {
    return render(
      <ProductAdd
        setLisäystila={setLisäystila}
        setIsPositive={setIsPositive}
        setMessage={setMessage}
        setShowMessage={setShowMessage}
        onProductAdded={onProductAdded}
      />
    );
  };

  // ------------------------------------
  // Testi 1: Alkulataus ja datan haku
  // ------------------------------------
  test("hakee brändit ja mallit komponentin latautuessa", async () => {
    renderComponent();
    
    // Tarkistetaan, että palvelukutsut on tehty
    await waitFor(() => {
      expect(BrandService.getAll).toHaveBeenCalledTimes(1);
      expect(ModelService.getAll).toHaveBeenCalledTimes(1);
    });
    
    // Tarkistetaan, että uudet brändit näkyvät valikossa
    expect(screen.getByText("Titleist")).toBeInTheDocument();
    expect(screen.getByText("Callaway")).toBeInTheDocument();
  });

  // ------------------------------------
  // Testi 2: Onnistunut tuotteen lisäys
  // ------------------------------------
  test("lähettää uuden tuotteen ja nollaa lomakkeen onnistuessaan", async () => {
    renderComponent();
    
    // VAIHE 0: ODOTA DATAN LATAUTUMISTA. Tämä varmistaa, että 'selects' löytyy ja state on asetettu.
    await waitFor(() => expect(BrandService.getAll).toHaveBeenCalled());
    
    // Haetaan valikot (merkki on 0, malli on 1)
    const selects = screen.getAllByRole("combobox");
    const brandSelect = selects[0]; 
    const modelSelect = selects[1];  

    // 1. Täytetään lomake golf-tiedolla
    fireEvent.change(screen.getByPlaceholderText("Tuotteen nimi"), { target: { value: "Titleist T100 Irons Set" } });
    fireEvent.change(screen.getByPlaceholderText("Kuvaus"), { target: { value: "Kevyt rautasetti" } });
    fireEvent.change(screen.getByPlaceholderText("Hinta (€)"), { target: { value: "999.90" } });
    fireEvent.change(screen.getByPlaceholderText("Kuvan URL"), { target: { value: "http://golfshop.com/t100.jpg" } });

    // 2. Valitaan brändi (Titleist, ID: 1). Tämä laukaisee mallien suodatuksen.
    fireEvent.change(brandSelect, { target: { value: "1" } });

    // 3. Valitaan malli (T100 Irons, ID: 101) - Mallien pitäisi olla nyt suodatettu Titleistille
    // Käytetään findByRole odottamaan dynaamisen option ilmestymistä, 
    // mikä varmistaa renderöinnin ennen valintaa.
    await screen.findByRole('option', { name: 'T100 Irons' }); 

    // Varmistetaan toinen optio (sen pitäisi olla renderöity samassa syklissä)
    expect(screen.getByRole('option', { name: 'Vokey SM9' })).toBeInTheDocument();
    
    // Valitaan malli
    fireEvent.change(modelSelect, { target: { value: "101" } });

    // 4. Lähetetään lomake
    fireEvent.click(screen.getByRole("button", { name: /Tallenna/i }));

    // 5. Tarkistetaan ProductService.create kutsu
    await waitFor(() => {
      expect(ProductService.create).toHaveBeenCalledTimes(1);
      expect(ProductService.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 1,
        title: "Titleist T100 Irons Set",
        price: 999.90,
        imageUrl: "http://golfshop.com/t100.jpg",
        brandId: 1,
        modelId: 101,
        // listingDate tarkistetaan vain olemassaolosta
        listingDate: expect.any(String),
      }));
    });

    // 6. Tarkistetaan tilamuutokset ja viestit
    expect(onProductAdded).toHaveBeenCalledWith(mockCreatedProduct);
    expect(setLisäystila).toHaveBeenCalledWith(false);
    expect(setMessage).toHaveBeenCalledWith("Lisättiin uusi tuote: Titleist T100 Irons Set");
    expect(setIsPositive).toHaveBeenCalledWith(true);
  });
  
  // ------------------------------------
  // Testi 3: Brändi- ja mallisuodatus
  // ------------------------------------
  test("suodattaa mallit oikein valitun merkin perusteella", async () => {
    renderComponent();
    
    // Odotetaan datan latautumista
    await waitFor(() => expect(BrandService.getAll).toHaveBeenCalled());
    
    // Haetaan valikot (merkki on 0, malli on 1)
    const selects = screen.getAllByRole("combobox");
    const brandSelect = selects[0];
    const modelSelect = selects[1];
    
    const rogueDriver = 'Rogue ST Driver';
    const t100Irons = 'T100 Irons';

    // Tarkista aluksi, että golf-mailat eivät ole näkyvissä
    expect(screen.queryByRole('option', { name: t100Irons })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: rogueDriver })).not.toBeInTheDocument();
    
    // 1. Valitaan Callaway (ID: 2)
    fireEvent.change(brandSelect, { target: { value: "2" } });
    
    // Vain Callaway-mallit (Rogue ST Driver) pitäisi olla nyt valittavissa
    // Odotetaan, että elementti on renderöity (asynkroninen state-muutos)
    await waitFor(() => {
        expect(screen.getByRole('option', { name: rogueDriver })).toBeInTheDocument();
    });
    // Varmistetaan, että Titleist-mallit eivät ole näkyvissä
    expect(screen.queryByRole('option', { name: t100Irons })).not.toBeInTheDocument();

    // 2. Valitaan Titleist (ID: 1)
    fireEvent.change(brandSelect, { target: { value: "1" } });
    
    // Vain Titleist-mallit (T100 Irons, Vokey SM9) pitäisi olla valittavissa
    // Odotetaan renderöitymistä
    await waitFor(() => {
        expect(screen.getByRole('option', { name: t100Irons })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Vokey SM9' })).toBeInTheDocument();
    });
    // Varmistetaan, että Callaway-mallit eivät ole näkyvissä
    expect(screen.queryByRole('option', { name: rogueDriver })).not.toBeInTheDocument();
  });

  // ------------------------------------
  // Testi 4: Käyttäjä ei ole kirjautunut sisään
  // ------------------------------------
  test("näyttää virheviestin, jos käyttäjä ei ole kirjautunut sisään", async () => {
    localStorage.clear(); // Poistetaan userId
    renderComponent();

    // Täytetään pakolliset kentät 
    fireEvent.change(screen.getByPlaceholderText("Tuotteen nimi"), { target: { value: "Palloja" } });
    fireEvent.change(screen.getByPlaceholderText("Hinta (€)"), { target: { value: "45.90" } });

    fireEvent.click(screen.getByRole("button", { name: /Tallenna/i }));

    // Tarkistetaan virheviesti
    await waitFor(() => {
        expect(setMessage).toHaveBeenCalledWith('Et ole kirjautunut sisään.');
        expect(setIsPositive).toHaveBeenCalledWith(false);
        expect(setShowMessage).toHaveBeenCalledWith(true);
    });
    
    // Varmistetaan, ettei ProductService.create-funktiota kutsuttu
    expect(ProductService.create).not.toHaveBeenCalled();
  });
  
  // ------------------------------------
  // Testi 5: Tuotteen luonnin virhe
  // ------------------------------------
  test("näyttää virheviestin, jos tuotteen luonti epäonnistuu", async () => {
    // Asetetaan create-palvelu palauttamaan virhe
    ProductService.create.mockRejectedValue(new Error("Network Error"));
    
    renderComponent();

    // Täytetään lomake
    fireEvent.change(screen.getByPlaceholderText("Tuotteen nimi"), { target: { value: "Virhe Tuote" } });
    fireEvent.change(screen.getByPlaceholderText("Hinta (€)"), { target: { value: "50" } });

    // Lähetetään lomake
    fireEvent.click(screen.getByRole("button", { name: /Tallenna/i }));

    // Tarkistetaan, että ProductService.create kutsuttiin
    await waitFor(() => {
        expect(ProductService.create).toHaveBeenCalledTimes(1);
    });

    // Tarkistetaan virheviesti
    expect(setMessage).toHaveBeenCalledWith('Network Error');
    expect(setIsPositive).toHaveBeenCalledWith(false);
    expect(setShowMessage).toHaveBeenCalledWith(true);
    
    // Varmistetaan, ettei lisäystilaa suljettu
    expect(setLisäystila).not.toHaveBeenCalledWith(false);
    // Varmistetaan, ettei onProductAdded kutsuttu
    expect(onProductAdded).not.toHaveBeenCalled();
  });
});
