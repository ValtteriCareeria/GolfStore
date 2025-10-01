import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";
import UserService from "./services/User";

// Mockataan UserService
vi.mock("./services/User", () => ({
  default: {
    create: vi.fn()
  }
}));

describe("Register component", () => {
  const setIsPositive = vi.fn();
  const setMessage = vi.fn();
  const setShowMessage = vi.fn();

  const renderRegister = () =>
    render(
      <MemoryRouter>
        <Register
          setIsPositive={setIsPositive}
          setMessage={setMessage}
          setShowMessage={setShowMessage}
        />
      </MemoryRouter>
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders registration form fields", () => {
    renderRegister();

    expect(screen.getByPlaceholderText("Etunimi")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Sukunimi")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Sähköposti")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Puhelinnumero")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Käyttäjätunnus")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Salasana")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Vahvista salasana")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Rekisteröidy")).toBeInTheDocument();
  });

  test("shows error when passwords do not match", async () => {
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText("Etunimi"), {
      target: { value: "Matti" }
    });
    fireEvent.change(screen.getByPlaceholderText("Sukunimi"), {
      target: { value: "Meikäläinen" }
    });
    fireEvent.change(screen.getByPlaceholderText("Sähköposti"), {
      target: { value: "matti@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Käyttäjätunnus"), {
      target: { value: "matti123" }
    });
    fireEvent.change(screen.getByPlaceholderText("Salasana"), {
      target: { value: "salasana1" }
    });
    fireEvent.change(screen.getByPlaceholderText("Vahvista salasana"), {
      target: { value: "salasana2" }
    });

    fireEvent.click(screen.getByDisplayValue("Rekisteröidy"));

    await waitFor(() =>
      expect(setMessage).toHaveBeenCalledWith("Salasanat eivät täsmää!")
    );
    expect(setIsPositive).toHaveBeenCalledWith(false);
    expect(UserService.create).not.toHaveBeenCalled();
  });

  test("successful registration calls UserService.create", async () => {
    UserService.create.mockResolvedValueOnce({ status: 200 });

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText("Etunimi"), {
      target: { value: "Matti" }
    });
    fireEvent.change(screen.getByPlaceholderText("Sukunimi"), {
      target: { value: "Meikäläinen" }
    });
    fireEvent.change(screen.getByPlaceholderText("Sähköposti"), {
      target: { value: "matti@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Käyttäjätunnus"), {
      target: { value: "matti123" }
    });
    fireEvent.change(screen.getByPlaceholderText("Salasana"), {
      target: { value: "salasana1" }
    });
    fireEvent.change(screen.getByPlaceholderText("Vahvista salasana"), {
      target: { value: "salasana1" }
    });

    fireEvent.click(screen.getByDisplayValue("Rekisteröidy"));

    await waitFor(() =>
      expect(UserService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstname: "Matti",
          lastname: "Meikäläinen",
          email: "matti@example.com",
          username: "matti123",
          password: expect.any(String) // md5 hash
        })
      )
    );

    await waitFor(() =>
      expect(setMessage).toHaveBeenCalledWith(
        expect.stringContaining("Käyttäjä lisätty: Matti Meikäläinen")
      )
    );
    expect(setIsPositive).toHaveBeenCalledWith(true);
  });

  test("handles registration error", async () => {
    UserService.create.mockRejectedValueOnce(new Error("Virhe backendissä"));

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText("Etunimi"), {
      target: { value: "Matti" }
    });
    fireEvent.change(screen.getByPlaceholderText("Sukunimi"), {
      target: { value: "Meikäläinen" }
    });
    fireEvent.change(screen.getByPlaceholderText("Sähköposti"), {
      target: { value: "matti@example.com" }
    });
    fireEvent.change(screen.getByPlaceholderText("Käyttäjätunnus"), {
      target: { value: "matti123" }
    });
    fireEvent.change(screen.getByPlaceholderText("Salasana"), {
      target: { value: "salasana1" }
    });
    fireEvent.change(screen.getByPlaceholderText("Vahvista salasana"), {
      target: { value: "salasana1" }
    });

    fireEvent.click(screen.getByDisplayValue("Rekisteröidy"));

    await waitFor(() =>
      expect(setMessage).toHaveBeenCalledWith("Virhe backendissä")
    );
    expect(setIsPositive).toHaveBeenCalledWith(false);
  });
});
