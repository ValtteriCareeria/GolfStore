import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ProductList from "./ProductList";
import ProductService from "./services/Product";
import BrandService from "./services/BrandService";
import ModelService from "./services/ModelService";
import { MemoryRouter } from "react-router-dom";

// Mockataan vain osittain react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mock servicejä
vi.mock("./services/Product", () => ({
  __esModule: true,
  default: {
    setToken: vi.fn(),
    getAll: vi.fn(),
    remove: vi.fn()
  }
}));

vi.mock("./services/BrandService", () => ({
  __esModule: true,
  default: { getAll: vi.fn() }
}));

vi.mock("./services/ModelService", () => ({
  __esModule: true,
  default: { getAll: vi.fn() }
}));

describe("ProductList", () => {
  const setMessage = vi.fn();
  const setIsPositive = vi.fn();
  const setShowMessage = vi.fn();

  const mockProducts = [
    {
      productId: 1,
      title: "Testituote A",
      brand: { brandID: 1, name: "BrandA" },
      model: { modelID: 1, name: "ModelA" },
      price: 100,
      userId: 5,
      seller: { firstName: "Matti", lastName: "Meikäläinen" }
    },
    {
      productId: 2,
      title: "Testituote B",
      brand: { brandID: 2, name: "BrandB" },
      model: { modelID: 2, name: "ModelB" },
      price: 200,
      userId: 6,
      seller: { firstName: "Liisa", lastName: "Lahtinen" }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    ProductService.getAll.mockResolvedValue(mockProducts);
    BrandService.getAll.mockResolvedValue([{ brandID: 1, name: "BrandA" }, { brandID: 2, name: "BrandB" }]);
    ModelService.getAll.mockResolvedValue([{ modelID: 1, name: "ModelA" }, { modelID: 2, name: "ModelB" }]);
    localStorage.setItem("userId", "5"); // simuloidaan kirjautunut käyttäjä
    localStorage.setItem("accessLevelId", "1");
  });

  test("hakee tuotteet ja renderöi ne listaan", async () => {
    render(
      <MemoryRouter>
        <ProductList
          cart={[]}
          setCart={vi.fn()}
          setMessage={setMessage}
          setIsPositive={setIsPositive}
          setShowMessage={setShowMessage}
        />
      </MemoryRouter>
    );

    // Odotetaan että tuotteet näkyvät
    expect(await screen.findByText("Testituote A")).toBeInTheDocument();
    expect(await screen.findByText("Testituote B")).toBeInTheDocument();

    // Myyjä näkyy
    expect(screen.getByText(/Matti Meikäläinen/)).toBeInTheDocument();
    expect(screen.getByText(/Liisa Lahtinen/)).toBeInTheDocument();

    // Hinnat näkyvät
    expect(screen.getByText(/100 €/)).toBeInTheDocument();
    expect(screen.getByText(/200 €/)).toBeInTheDocument();
  });
});
