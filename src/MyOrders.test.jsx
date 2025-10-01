import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MyOrders from "./MyOrders";
import orderService from "./services/OrderService";

// Mockataan react-router-dom osittain
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to }) => <a href={to}>{children}</a>
  };
});

// Mockataan orderService
vi.mock("./services/OrderService", () => ({
  __esModule: true,
  default: {
    setToken: vi.fn(),
    getMyOrders: vi.fn()
  }
}));

describe("MyOrders component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("näyttää viestin jos käyttäjällä ei ole tilauksia", async () => {
    localStorage.setItem("userId", "1");
    localStorage.setItem("token", "fake-token");

    orderService.getMyOrders.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <MyOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Sinulla ei ole vielä tilauksia.")).toBeInTheDocument();
    });
  });

  test("hakee tilaukset ja renderöi ne listaan", async () => {
    localStorage.setItem("userId", "1");
    localStorage.setItem("token", "fake-token");

    orderService.getMyOrders.mockResolvedValueOnce([
      {
        orderId: 101,
        status: "Toimitettu",
        totalAmount: 120,
        address: { streetAddress: "Katu 1", postalCode: "00100", city: "Helsinki", country: "Suomi" },
        deliveryOption: { name: "Posti", cost: 5 },
        paymentMethod: { name: "Kortti" },
        orderItems: [{ productId: 10, quantity: 2, priceAtPurchase: 50 }]
      }
    ]);

    render(
      <MemoryRouter>
        <MyOrders />
      </MemoryRouter>
    );

    // Odotetaan että tilaus renderöityy
    await waitFor(() => {
      const summary = screen.getByText(/Tilaus #101/);
      expect(summary).toBeInTheDocument();
      expect(screen.getByText("Toimitettu")).toBeInTheDocument();
      // Käytetään parentElement ja regex tarkistamaan summa joustavasti
      expect(summary.parentElement).toHaveTextContent(/120\s*€/);
    });
  });

  test("laajentaa tilauksen yksityiskohdat klikkauksella", async () => {
    localStorage.setItem("userId", "1");
    localStorage.setItem("token", "fake-token");

    orderService.getMyOrders.mockResolvedValueOnce([
      {
        orderId: 101,
        status: "Toimitettu",
        totalAmount: 120,
        address: { streetAddress: "Katu 1", postalCode: "00100", city: "Helsinki", country: "Suomi" },
        deliveryOption: { name: "Posti", cost: 5 },
        paymentMethod: { name: "Kortti" },
        orderItems: [{ productId: 10, quantity: 2, priceAtPurchase: 50 }]
      }
    ]);

    render(
      <MemoryRouter>
        <MyOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      const summary = screen.getByText(/Tilaus #101/);
      fireEvent.click(summary);

      // Laajennettu näkymä
      expect(screen.getByText("Toimitusosoite")).toBeInTheDocument();
      expect(screen.getByText(/Katu 1/)).toBeInTheDocument();
      expect(screen.getByText("Toimitustapa")).toBeInTheDocument();
      expect(screen.getByText("Posti (5 €)")).toBeInTheDocument();
      expect(screen.getByText("Maksutapa")).toBeInTheDocument();
      expect(screen.getByText("Kortti")).toBeInTheDocument();
      expect(screen.getByText("Tuotteet")).toBeInTheDocument();
      expect(screen.getByText("Tuote 10")).toBeInTheDocument();
    });
  });
});
