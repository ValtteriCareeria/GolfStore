import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import UserList from "./UserList";
import UserService from "./services/User";

// Mockataan UserAdd ja UserEdit ettei tarvitse testata niitä tässä
vi.mock("./UserAdd", () => ({
  default: ({ setLisäystila }) => (
    <div data-testid="mock-useradd">
      Mocked UserAdd
      <button onClick={() => setLisäystila(false)}>Close Add</button>
    </div>
  )
}));

vi.mock("./UserEdit", () => ({
  default: ({ setMuokkaustila }) => (
    <div data-testid="mock-useredit">
      Mocked UserEdit
      <button onClick={() => setMuokkaustila(false)}>Close Edit</button>
    </div>
  )
}));

// Mockataan UserService
vi.mock("./services/User", () => ({
  default: {
    getAll: vi.fn(),
    remove: vi.fn()
  }
}));

describe("UserList component", () => {
  const setMessage = vi.fn();
  const setIsPositive = vi.fn();
  const setShowMessage = vi.fn();

  const sampleUsers = [
    {
      userId: 1,
      firstName: "Matti",
      lastName: "Meikäläinen",
      userName: "matti123",
      email: "matti@example.com",
      phoneNumber: "12345",
      accesslevelId: 2
    },
    {
      userId: 2,
      firstName: "Liisa",
      lastName: "Lahtinen",
      userName: "liisa456",
      email: "liisa@example.com",
      phoneNumber: "",
      accesslevelId: 1
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    UserService.getAll.mockResolvedValue(sampleUsers);
  });

  test("renders header and Add button", async () => {
    render(<UserList user={{}} setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} />);
    expect(await screen.findByText("Users")).toBeInTheDocument();
    expect(screen.getByText("➕ Add new")).toBeInTheDocument();
  });

  test("renders users in table", async () => {
    render(<UserList user={{}} setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} />);
    expect(await screen.findByText("Matti")).toBeInTheDocument();
    expect(screen.getByText("Liisa")).toBeInTheDocument();
  });

  test("filters by last name", async () => {
    render(<UserList user={{}} setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} />);
    await screen.findByText("Matti");

    fireEvent.change(screen.getByPlaceholderText("Search by Last Name"), {
      target: { value: "Meikäläinen" }
    });

    expect(screen.getByText("Matti")).toBeInTheDocument();
    expect(screen.queryByText("Liisa")).not.toBeInTheDocument();
  });

  test("delete user confirmed", async () => {
    window.confirm = vi.fn().mockReturnValue(true);
    UserService.remove.mockResolvedValue({ status: 200 });

    render(<UserList user={{}} setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} />);
    await screen.findByText("Matti");

    fireEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(UserService.remove).toHaveBeenCalledWith(1);
      expect(setMessage).toHaveBeenCalledWith("Successfully removed user Matti");
      expect(setIsPositive).toHaveBeenCalledWith(true);
    });
  });

  test("delete user cancelled", async () => {
    window.confirm = vi.fn().mockReturnValue(false);

    render(<UserList user={{}} setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} />);
    await screen.findByText("Matti");

    fireEvent.click(screen.getAllByText("Delete")[0]);

    expect(setMessage).toHaveBeenCalledWith("Poisto peruttu onnistuneesti.");
    expect(setIsPositive).toHaveBeenCalledWith(true);
  });

  test("edit user shows UserEdit component", async () => {
    render(<UserList user={{}} setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} />);
    await screen.findByText("Matti");

    fireEvent.click(screen.getAllByText("Edit")[0]);

    expect(await screen.findByTestId("mock-useredit")).toBeInTheDocument();
  });

  test("add new user shows UserAdd component", async () => {
    render(<UserList user={{}} setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} />);
    await screen.findByText("Matti");

    fireEvent.click(screen.getByText("➕ Add new"));

    expect(await screen.findByTestId("mock-useradd")).toBeInTheDocument();
  });
});
