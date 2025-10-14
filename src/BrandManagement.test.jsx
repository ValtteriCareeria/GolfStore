import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import BrandManagement from "./BrandManagement";
import BrandService from "./services/BrandService";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

// Mockataan BrandService
vi.mock("./services/BrandService", () => ({
  default: {
    setToken: vi.fn(),
    getAll: vi.fn(),
    add: vi.fn(),
    remove: vi.fn(),
  },
}));

describe("BrandManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderöi otsikon ja hakee datan onnistuneesti", async () => {
    BrandService.getAll.mockResolvedValue([
      { brandID: 1, name: "Brand1" },
      { brandID: 2, name: "Brand2" },
    ]);

    render(
      <MemoryRouter>
        <BrandManagement />
      </MemoryRouter>
    );

    expect(screen.getByText(/Brandien hallinta/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Brand1")).toBeInTheDocument();
      expect(screen.getByText("Brand2")).toBeInTheDocument();
    });
  });

  it("lisää uuden brandin onnistuneesti", async () => {
    BrandService.getAll.mockResolvedValue([]);
    BrandService.add.mockResolvedValue({ brandID: 3, name: "NewBrand" });

    render(
      <MemoryRouter>
        <BrandManagement />
      </MemoryRouter>
    );

    // kirjoitetaan inputtiin
    const input = screen.getByPlaceholderText(/Uusi merkki/i);
    fireEvent.change(input, { target: { value: "NewBrand" } });

    // klikataan Lisää
    fireEvent.click(screen.getByText("Lisää"));

    await waitFor(() => {
      expect(BrandService.add).toHaveBeenCalledWith({ name: "NewBrand" });
      expect(screen.getByText("NewBrand")).toBeInTheDocument();
    });
  });

  it("poistaa brandin onnistuneesti", async () => {
    BrandService.getAll.mockResolvedValue([{ brandID: 4, name: "DeleteMe" }]);
    BrandService.remove.mockResolvedValue({});

    // Mockataan confirm että palauttaa true
    vi.spyOn(window, "confirm").mockImplementation(() => true);

    render(
      <MemoryRouter>
        <BrandManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("DeleteMe")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(BrandService.remove).toHaveBeenCalledWith(4);
      expect(screen.queryByText("DeleteMe")).not.toBeInTheDocument();
    });
  });
});
