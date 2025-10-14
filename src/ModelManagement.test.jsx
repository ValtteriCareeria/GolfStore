import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ModelManagement from "./ModelManagement";
import ModelService from "./services/ModelService";
import BrandService from "./services/BrandService";

vi.mock("./services/ModelService");
vi.mock("./services/BrandService");

describe("ModelManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "fake-token");
  });

 test("renderöi otsikon ja hakee datan onnistuneesti", async () => {
  ModelService.getAll.mockResolvedValueOnce([
    { modelID: 1, name: "Malli1", brand: { name: "Brand1" } },
  ]);
  BrandService.getAll.mockResolvedValueOnce([
    { brandID: 1, name: "Brand1" },
  ]);

  render(
    <MemoryRouter>
      <ModelManagement />
    </MemoryRouter>
  );

  // Otsikko löytyy
  expect(screen.getByText(/Model Management/i)).toBeInTheDocument();

  // Varmistetaan että mallilista renderöityy
  expect(await screen.findByText(/Malli1/i)).toBeInTheDocument();

  // Haetaan select-elementti ja tarkistetaan että siellä on Brand1
  const select = screen.getByRole("combobox");
  expect(within(select).getByText("Brand1")).toBeInTheDocument();

  // Varmistetaan myös että listassa näkyy Brand1
  expect(screen.getByText(/Malli1 \(Brand1\)/i)).toBeInTheDocument();
});

  test("näyttää tyhjän viestin jos lista on tyhjä", async () => {
    ModelService.getAll.mockResolvedValueOnce([]);
    BrandService.getAll.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <ModelManagement />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Ei vielä malleja/i)).toBeInTheDocument();
  });

  test("näyttää brändit selectissä", async () => {
    ModelService.getAll.mockResolvedValueOnce([]);
    BrandService.getAll.mockResolvedValueOnce([
      { brandID: 2, name: "TestBrand" },
    ]);

    render(
      <MemoryRouter>
        <ModelManagement />
      </MemoryRouter>
    );

    expect(await screen.findByText("TestBrand")).toBeInTheDocument();
  });

  test("console.error kutsutaan jos haku epäonnistuu", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    ModelService.getAll.mockRejectedValueOnce(new Error("fail"));
    BrandService.getAll.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <ModelManagement />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Virhe mallien tai brändien haussa:"),
        expect.any(Error)
      )
    );
    errorSpy.mockRestore();
  });
});
