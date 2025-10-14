import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DeliveryOptionList from "./DeliveryOptionList";
import DeliveryOptionService from "./services/DeliveryOptionService";


vi.mock("./services/DeliveryOptionService");

describe("DeliveryOptionList", () => {
  const mockSetMessage = vi.fn();
  const mockSetIsPositive = vi.fn();
  const mockSetShowMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "fake-token");
  });

  test("näyttää lataustekstin aluksi", async () => {
    DeliveryOptionService.getAll.mockResolvedValueOnce([]);
    render(
      <MemoryRouter>
        <DeliveryOptionList
          setMessage={mockSetMessage}
          setIsPositive={mockSetIsPositive}
          setShowMessage={mockSetShowMessage}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Ladataan/i)).toBeInTheDocument();
    await waitFor(() => expect(DeliveryOptionService.getAll).toHaveBeenCalled());
  });

  test("renderöi toimitustavat onnistuneesti", async () => {
    DeliveryOptionService.getAll.mockResolvedValueOnce([
      { deliveryOptionId: 1, name: "Posti", cost: 5 },
      { deliveryOptionId: 2, name: "Matkahuolto", cost: 7 },
    ]);

    render(
      <MemoryRouter>
        <DeliveryOptionList
          setMessage={mockSetMessage}
          setIsPositive={mockSetIsPositive}
          setShowMessage={mockSetShowMessage}
        />
      </MemoryRouter>
    );

    expect(await screen.findByText("Posti")).toBeInTheDocument();
    expect(screen.getByText("Matkahuolto")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  test("näyttää viestin jos lista on tyhjä", async () => {
    DeliveryOptionService.getAll.mockResolvedValueOnce([]);

    render(
      <MemoryRouter>
        <DeliveryOptionList
          setMessage={mockSetMessage}
          setIsPositive={mockSetIsPositive}
          setShowMessage={mockSetShowMessage}
        />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Ei toimitustapoja/)).toBeInTheDocument();
  });

  test("näyttää virheilmoituksen jos haku epäonnistuu", async () => {
    DeliveryOptionService.getAll.mockRejectedValueOnce(new Error("fail"));

    render(
      <MemoryRouter>
        <DeliveryOptionList
          setMessage={mockSetMessage}
          setIsPositive={mockSetIsPositive}
          setShowMessage={mockSetShowMessage}
        />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/Toimitustapojen lataaminen epäonnistui/i)
    ).toBeInTheDocument();
  });
});
