import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import LoginService from "./services/Auth";

// Mockataan Auth-palvelu
vi.mock("./services/Auth", () => ({
  default: {
    authenticate: vi.fn()
  }
}));

describe("Login component", () => {
  const setIsPositive = vi.fn();
  const setMessage = vi.fn();
  const setShowMessage = vi.fn();
  const setLoggedInUser = vi.fn();

  const renderLogin = () =>
    render(
      <MemoryRouter>
        <Login
          setIsPositive={setIsPositive}
          setMessage={setMessage}
          setShowMessage={setShowMessage}
          setLoggedInUser={setLoggedInUser}
        />
      </MemoryRouter>
    );

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("renders login form fields", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("Käyttäjätunnus")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Salasana")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("submits login with username and password", async () => {
    LoginService.authenticate.mockResolvedValueOnce({
      status: 200,
      data: {
        username: "testuser",
        accesslevelId: 1,
        token: "fake-token",
        userId: 123
      }
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Käyttäjätunnus"), {
      target: { value: "testuser" }
    });
    fireEvent.change(screen.getByPlaceholderText("Salasana"), {
      target: { value: "secret" }
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() =>
      expect(LoginService.authenticate).toHaveBeenCalledWith({
        username: "testuser",
        password: "secret",
        passwordMd5: expect.any(String) // hash tarkistus
      })
    );

    await waitFor(() =>
      expect(setLoggedInUser).toHaveBeenCalledWith("testuser")
    );
    expect(setIsPositive).toHaveBeenCalledWith(true);
  });

  test("handles login error", async () => {
    LoginService.authenticate.mockRejectedValueOnce({
      response: { data: { message: "Virheellinen tunnus" } }
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Käyttäjätunnus"), {
      target: { value: "wrong" }
    });
    fireEvent.change(screen.getByPlaceholderText("Salasana"), {
      target: { value: "wrongpass" }
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() =>
      expect(setMessage).toHaveBeenCalledWith("Virhe: Virheellinen tunnus")
    );
    expect(setIsPositive).toHaveBeenCalledWith(false);
  });

  test("clears fields when 'Tyhjennä' is clicked", () => {
    renderLogin();

    const usernameInput = screen.getByPlaceholderText("Käyttäjätunnus");
    const passwordInput = screen.getByPlaceholderText("Salasana");

    fireEvent.change(usernameInput, { target: { value: "abc" } });
    fireEvent.change(passwordInput, { target: { value: "123" } });

    fireEvent.click(screen.getByText("Tyhjennä"));

    expect(usernameInput.value).toBe("");
    expect(passwordInput.value).toBe("");
  });

  // ✅ Uusi testi: onnistunut login tallentaa localStorageen
  test("stores user data in localStorage after successful login", async () => {
    const mockUser = {
      username: "testuser",
      accesslevelId: 1,
      token: "fake-token",
      userId: 123
    };

    LoginService.authenticate.mockResolvedValueOnce({
      status: 200,
      data: mockUser
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Käyttäjätunnus"), {
      target: { value: "testuser" }
    });
    fireEvent.change(screen.getByPlaceholderText("Salasana"), {
      target: { value: "secret" }
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(localStorage.getItem("username")).toBe("testuser");
      expect(localStorage.getItem("accessLevelId")).toBe("1");
      expect(localStorage.getItem("token")).toBe("fake-token");
      expect(localStorage.getItem("userId")).toBe("123");
      expect(JSON.parse(localStorage.getItem("user"))).toEqual(mockUser);
    });
  });

  // ✅ Uusi testi: epäonnistunut login ei muuta localStoragea
  test("does not store anything in localStorage if login fails", async () => {
    LoginService.authenticate.mockRejectedValueOnce({
      response: { data: { message: "Virheellinen tunnus" } }
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("Käyttäjätunnus"), {
      target: { value: "wrong" }
    });
    fireEvent.change(screen.getByPlaceholderText("Salasana"), {
      target: { value: "wrongpass" }
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(setMessage).toHaveBeenCalledWith("Virhe: Virheellinen tunnus");
    });

    // Varmistetaan että localStorage on tyhjä
    expect(localStorage.length).toBe(0);
  });
});
