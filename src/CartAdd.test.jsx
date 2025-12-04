import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CartAdd from "./CartAdd";
import paymentMethodService from "./services/PaymentMethod";
import deliveryOptionService from "./services/DeliveryOptionService";
import orderService from "./services/OrderService";
import addressService from "./services/AddressService";

// Mockataan palvelut oikein
vi.mock("./services/PaymentMethod", () => ({
  __esModule: true,
  default: { setToken: vi.fn(), getAll: vi.fn() }
}));
vi.mock("./services/DeliveryOptionService", () => ({
  __esModule: true,
  default: { setToken: vi.fn(), getAll: vi.fn() }
}));
vi.mock("./services/OrderService", () => ({
  __esModule: true,
  default: { setToken: vi.fn(), create: vi.fn() }
}));
vi.mock("./services/AddressService", () => ({
  __esModule: true,
  default: { setToken: vi.fn(), create: vi.fn() }
}));

describe("CartAdd component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("userId", "1");
    localStorage.setItem("token", "fake-token");

    // Palvelut palauttavat onnistuneesti
    paymentMethodService.getAll.mockResolvedValue([{ paymentMethodId: 1, name: "Kortti" }]);
    deliveryOptionService.getAll.mockResolvedValue([{ deliveryOptionId: 1, name: "Posti", cost: 5 }]);
    addressService.create.mockResolvedValue({ addressId: 1 });
    orderService.create.mockResolvedValue({});
  });

  test("lähettää tilauksen ja tyhjentää ostoskorin", async () => {
    const setCart = vi.fn();
    const setMessage = vi.fn();
    const setIsPositive = vi.fn();
    const setShowMessage = vi.fn();

    const cart = [{ productId: 10, title: "Tuote", price: 50, quantity: 2 }];

    render(
      <MemoryRouter>
        <CartAdd
          cart={cart}
          setCart={setCart}
          setMessage={setMessage}
          setIsPositive={setIsPositive}
          setShowMessage={setShowMessage}
        />
      </MemoryRouter>
    );

    // Täytetään osoitetiedot
    fireEvent.change(screen.getByPlaceholderText("Katuosoite"), { target: { value: "Katu 1" } });
    fireEvent.change(screen.getByPlaceholderText("Kaupunki"), { target: { value: "Helsinki" } });
    fireEvent.change(screen.getByPlaceholderText("Postinumero"), { target: { value: "00100" } });
    fireEvent.change(screen.getByPlaceholderText("Maa"), { target: { value: "Suomi" } });

    // Valitaan toimitus- ja maksutapa oikein
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } }); // delivery
    fireEvent.change(selects[1], { target: { value: "1" } }); // payment

    // *** KORJATTU RIVI: Etsitään submit-nappi ja navigoidaan siitä isäntälomakkeeseen ***
    const submitButton = screen.getByRole("button", { name: /Vahvista tilaus/i });
    const form = submitButton.closest('form');
    
    // Tarkistetaan varmuuden vuoksi, että lomake löytyi, ennen kuin lähetetään se.
    if (!form) {
      throw new Error("Lomaketta (form) ei löytynyt submit-napin isäntäelementtinä.");
    }
    
    fireEvent.submit(form);
    // *** MUUTOS PÄÄTTYY ***

    await waitFor(() => {
      expect(addressService.create).toHaveBeenCalledTimes(1);
      expect(orderService.create).toHaveBeenCalledTimes(1);
      expect(setCart).toHaveBeenCalledWith([]);
      expect(setMessage).toHaveBeenCalledWith("Tilaus onnistui! Tuotteet on nyt poistettu myyntilistalta.");
      expect(setIsPositive).toHaveBeenCalledWith(true);
      expect(setShowMessage).toHaveBeenCalledWith(true);
    });
  });
});
