import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import OrderList from "./OrderList";
import OrderService from "./services/OrderService";

// Mockataan react-router-dom vain osittain
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mock OrderService
vi.mock("./services/OrderService", () => ({
  __esModule: true,
  default: {
    setToken: vi.fn(),
    getAll: vi.fn(),
    remove: vi.fn()
  }
}));

describe("OrderList", () => {
  const setMessage = vi.fn();
  const setIsPositive = vi.fn();
  const setShowMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("hakee tilaukset ja renderöi ne listaan", async () => {
    OrderService.getAll.mockResolvedValueOnce([
      {
        orderId: 1,
        buyer: { firstName: "Matti", lastName: "Meikäläinen" },
        status: "Toimitettu",
        deliveryOption: { name: "Posti" },
        paymentMethod: { name: "Kortti" },
        totalAmount: 199.9
      },
      {
        orderId: 2,
        buyer: { firstName: "Teppo", lastName: "Testaaja" },
        status: "Odottaa",
        deliveryOption: { name: "Matkahuolto" },
        paymentMethod: { name: "Käteinen" },
        totalAmount: 59.5
      }
    ]);

    render(
      <MemoryRouter>
        <OrderList
          setMessage={setMessage}
          setIsPositive={setIsPositive}
          setShowMessage={setShowMessage}
        />
      </MemoryRouter>
    );

    // Aluksi näkyy "Ladataan..."
    expect(screen.getByText(/Ladataan/)).toBeInTheDocument();

    // Odotetaan että data renderöityy
    await waitFor(() => {
      expect(screen.getByText("Matti Meikäläinen")).toBeInTheDocument();
      expect(screen.getByText("Teppo Testaaja")).toBeInTheDocument();
    });

    // Varmistetaan että taulukossa näkyy status ja hinta
    expect(screen.getByText("Toimitettu")).toBeInTheDocument();
    expect(screen.getByText("Odottaa")).toBeInTheDocument();
    expect(screen.getByText("199.90 €")).toBeInTheDocument();
    expect(screen.getByText("59.50 €")).toBeInTheDocument();
  });

  test("näyttää virheilmoituksen jos haku epäonnistuu", async () => {
    OrderService.getAll.mockRejectedValueOnce(new Error("Virhe backendissä"));

    render(
      <MemoryRouter>
        <OrderList
          setMessage={setMessage}
          setIsPositive={setIsPositive}
          setShowMessage={setShowMessage}
        />
      </MemoryRouter>
    );

    // Aluksi näkyy "Ladataan..."
    expect(screen.getByText(/Ladataan/)).toBeInTheDocument();

    // Odotetaan että error tulee näkyviin
    await waitFor(() => {
      expect(screen.getByText("Tilauksien haku epäonnistui.")).toBeInTheDocument();
    });
  });
});
