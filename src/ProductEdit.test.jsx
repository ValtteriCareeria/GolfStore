
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ProductEdit from "./ProductEdit";
import ProductService from "./services/Product";
import BrandService from "./services/BrandService";
import ModelService from "./services/ModelService";

// Mockataan palvelut
vi.mock("./services/Product", () => ({
  __esModule: true,
  default: { update: vi.fn() }
}));

vi.mock("./services/BrandService", () => ({
  __esModule: true,
  default: { getAll: vi.fn() }
}));

vi.mock("./services/ModelService", () => ({
  __esModule: true,
  default: { getAll: vi.fn() }
}));

describe("ProductEdit component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("userId", "1");
    localStorage.setItem("accessLevelId", "1");

    BrandService.getAll.mockResolvedValue([{ brandID: 1, name: "Brand1" }]);
    ModelService.getAll.mockResolvedValue([{ modelID: 1, name: "Model1", brand: { brandID: 1 } }]);
    ProductService.update.mockResolvedValue({});
  });

  test("muokkaa tuotteen tiedot ja kutsuu päivityspalvelua", async () => {
    const muokattavaProduct = {
      productId: 10,
      userId: 1,
      title: "Old Title",
      description: "Old desc",
      price: 100,
      imageUrl: "old.jpg",
      brand: { brandID: 1, name: "Brand1" },
      model: { modelID: 1, name: "Model1" }
    };

    const setMuokkaustila = vi.fn();
    const setMessage = vi.fn();
    const setIsPositive = vi.fn();
    const setShowMessage = vi.fn();
    const onProductUpdated = vi.fn();

    render(
      <ProductEdit
        setMuokkaustila={setMuokkaustila}
        muokattavaProduct={muokattavaProduct}
        setIsPositive={setIsPositive}
        setMessage={setMessage}
        setShowMessage={setShowMessage}
        onProductUpdated={onProductUpdated}
      />
    );

    // Odotetaan, että lomake latautuu
    await waitFor(() => expect(screen.getByLabelText("Tuotteen nimi")).toBeInTheDocument());

    // Muutetaan tuotteen nimi ja hinta
    fireEvent.change(screen.getByLabelText("Tuotteen nimi"), { target: { value: "New Title" } });
    fireEvent.change(screen.getByLabelText("Hinta (€)"), { target: { value: 120 } });

    fireEvent.click(screen.getByText("Tallenna"));

    await waitFor(() => {
  expect(ProductService.update).toHaveBeenCalledWith(
    expect.objectContaining({
      productId: 10,
      title: "New Title",
      price: "120", // Huom: string, koska input antaa stringin
      brandID: 1,
      modelID: 1,
      description: "Old desc",
      imageUrl: "old.jpg",
      userId: 1
    })
  );

  expect(onProductUpdated).toHaveBeenCalled();
  expect(setMessage).toHaveBeenCalledWith("Tuote päivitetty onnistuneesti!");
  expect(setIsPositive).toHaveBeenCalledWith(true);
  expect(setShowMessage).toHaveBeenCalledWith(true);
  expect(setMuokkaustila).toHaveBeenCalledWith(false);
});
  });
});
