import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MyProducts from "./MyProducts";
import ProductService from "./services/Product";

// Mockataan react-router-dom osittain
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mockataan ProductService
vi.mock("./services/Product", () => ({
  __esModule: true,
  default: {
    setToken: vi.fn(),
    getAll: vi.fn(),
    remove: vi.fn()
  }
}));

describe("MyProducts component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("näyttää viestin jos käyttäjällä ei ole tuotteita", async () => {
    localStorage.setItem("userId", "1");
    localStorage.setItem("accessLevelId", "2");
    localStorage.setItem("token", "fake-token");

    ProductService.getAll.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <MyProducts setMessage={vi.fn()} setIsPositive={vi.fn()} setShowMessage={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Sinulla ei ole vielä lisättyjä tuotteita.")).toBeInTheDocument();
    });
  });

  test("hakee käyttäjän tuotteet ja renderöi ne listaan", async () => {
    localStorage.setItem("userId", "1");
    localStorage.setItem("accessLevelId", "2");
    localStorage.setItem("token", "fake-token");

    const mockProducts = [
      {
        productId: 101,
        title: "Golf Pallo",
        price: 50,
        userId: 1,
        brand: { name: "Titleist" },
        model: { name: "ProV1" },
        description: "Laadukas golfpallo"
      },
      {
        productId: 102,
        title: "Golf Maila",
        price: 200,
        userId: 1,
        brand: { name: "Callaway" },
        model: { name: "Epic" },
        description: "Uusi maila"
      }
    ];

    ProductService.getAll.mockResolvedValueOnce(mockProducts);

    render(
      <MemoryRouter>
        <MyProducts setMessage={vi.fn()} setIsPositive={vi.fn()} setShowMessage={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Golf Pallo")).toBeInTheDocument();
      expect(screen.getByText("Golf Maila")).toBeInTheDocument();
      expect(screen.getByText(/Laadukas golfpallo/)).toBeInTheDocument();
      expect(screen.getByText(/Uusi maila/)).toBeInTheDocument();
      expect(screen.getByText("50 €")).toBeInTheDocument();
      expect(screen.getByText("200 €")).toBeInTheDocument();
    });
  });

  test("edit ja delete napit näkyvät ja delete toimii", async () => {
    localStorage.setItem("userId", "1");
    localStorage.setItem("accessLevelId", "2");
    localStorage.setItem("token", "fake-token");

    const mockProducts = [
      {
        productId: 101,
        title: "Golf Pallo",
        price: 50,
        userId: 1,
        brand: { name: "Titleist" },
        model: { name: "ProV1" },
        description: "Laadukas golfpallo"
      }
    ];

    ProductService.getAll.mockResolvedValueOnce(mockProducts);
    ProductService.remove.mockResolvedValueOnce();

    render(
      <MemoryRouter>
        <MyProducts setMessage={vi.fn()} setIsPositive={vi.fn()} setShowMessage={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      const editButton = screen.getByText("Muokkaa");
      const deleteButton = screen.getByText("Poista");

      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();

      // Mockataan window.confirm
      vi.spyOn(window, "confirm").mockReturnValueOnce(true);

      fireEvent.click(deleteButton);

      expect(ProductService.remove).toHaveBeenCalledWith(101);
    });
  });

  test("lataa lisää tuotteita", async () => {
    localStorage.setItem("userId", "1");
    localStorage.setItem("accessLevelId", "2");
    localStorage.setItem("token", "fake-token");

    const products = Array.from({ length: 12 }, (_, i) => ({
      productId: i + 1,
      title: `Tuote ${i + 1}`,
      price: i * 10,
      userId: 1
    }));

    ProductService.getAll.mockResolvedValueOnce(products);

    render(
      <MemoryRouter>
        <MyProducts setMessage={vi.fn()} setIsPositive={vi.fn()} setShowMessage={vi.fn()} />
      </MemoryRouter>
    );

    await waitFor(() => {
      // Vain ensimmäiset 9 näkyvissä
      expect(screen.getByText("Tuote 1")).toBeInTheDocument();
      expect(screen.getByText("Tuote 9")).toBeInTheDocument();
      expect(screen.queryByText("Tuote 10")).toBeNull();

      const loadMoreBtn = screen.getByText("Lataa lisää");
      fireEvent.click(loadMoreBtn);

      // Nyt lisää näkyviin
      expect(screen.getByText("Tuote 10")).toBeInTheDocument();
      expect(screen.getByText("Tuote 12")).toBeInTheDocument();
    });
  });
});
