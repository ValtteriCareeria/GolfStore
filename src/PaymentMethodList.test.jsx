import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import PaymentMethodList from "./PaymentMethodList";
import PaymentMethodService from "./services/PaymentMethod";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// Mockataan PaymentMethodService
vi.mock("./services/PaymentMethod", () => ({
  default: {
    setToken: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    remove: vi.fn(),
  },
}));

describe("PaymentMethodList", () => {
  const setMessage = vi.fn();
  const setIsPositive = vi.fn();
  const setShowMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("näyttää 'Access denied' jos käyttäjä ei ole admin", () => {
    localStorage.setItem("accessLevelId", "2"); // ei admin
    render(
      <MemoryRouter>
        <PaymentMethodList
          setMessage={setMessage}
          setIsPositive={setIsPositive}
          setShowMessage={setShowMessage}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Access denied. Only admins can view this page./i)
    ).toBeInTheDocument();
  });

  it("renderöi otsikon ja hakee maksutavat onnistuneesti", async () => {
    localStorage.setItem("accessLevelId", "1"); // admin
    PaymentMethodService.getAll.mockResolvedValue([
      { paymentMethodId: 1, name: "Kortti" },
      { paymentMethodId: 2, name: "MobilePay" },
    ]);

    render(
      <MemoryRouter>
        <PaymentMethodList
          setMessage={setMessage}
          setIsPositive={setIsPositive}
          setShowMessage={setShowMessage}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Maksutavat/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Kortti")).toBeInTheDocument();
      expect(screen.getByText("MobilePay")).toBeInTheDocument();
    });
  });

  it("lisää uuden maksutavan onnistuneesti", async () => {
    localStorage.setItem("accessLevelId", "1");
    PaymentMethodService.getAll.mockResolvedValue([]);
    PaymentMethodService.create.mockResolvedValue({
      paymentMethodId: 3,
      name: "Verkkopankki",
    });

    render(
      <MemoryRouter>
        <PaymentMethodList
          setMessage={setMessage}
          setIsPositive={setIsPositive}
          setShowMessage={setShowMessage}
        />
      </MemoryRouter>
    );

    // Syötetään arvo inputtiin
    const input = screen.getByPlaceholderText(/Uusi maksutapa/i);
    fireEvent.change(input, { target: { value: "Verkkopankki" } });

    // Klikataan "Lisää"
    fireEvent.click(screen.getByText("Lisää"));

    await waitFor(() => {
      expect(PaymentMethodService.create).toHaveBeenCalledWith({
        name: "Verkkopankki",
      });
      expect(setMessage).toHaveBeenCalledWith("Maksutapa 'Verkkopankki' lisätty!");
    });
  });

  it("poistaa maksutavan onnistuneesti", async () => {
    localStorage.setItem("accessLevelId", "1");
    PaymentMethodService.getAll.mockResolvedValue([
      { paymentMethodId: 4, name: "Poistettava" },
    ]);
    PaymentMethodService.remove.mockResolvedValue({});

    // Mockataan confirm
    vi.spyOn(window, "confirm").mockImplementation(() => true);

    render(
      <MemoryRouter>
        <PaymentMethodList
          setMessage={setMessage}
          setIsPositive={setIsPositive}
          setShowMessage={setShowMessage}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Poistettava")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(PaymentMethodService.remove).toHaveBeenCalledWith(4);
      expect(setMessage).toHaveBeenCalledWith("Maksutapa 'Poistettava' poistettu!");
    });
  });
});
