import axios from "axios";
import ProductService from './services/Product';
import { vi } from "vitest";

vi.mock("axios");

describe("ProductService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("asettaa tokenin oikein", () => {
    ProductService.setToken("abc123");
    // Käytännössä ei voi suoraan lukea private token-muuttujaa,
    // mutta varmistetaan epäsuorasti, että se menee headeriin
    axios.get.mockResolvedValue({ data: [] });

    return ProductService.getAll().then(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/products",
        expect.objectContaining({
          headers: { Authorization: "bearer abc123" },
        })
      );
    });
  });

  it("kutsuu getAll ja palauttaa datan", async () => {
    const data = [{ productId: 1, name: "Test" }];
    axios.get.mockResolvedValue({ data });

    ProductService.setToken("xyz");
    const result = await ProductService.getAll();

    expect(result).toEqual(data);
    expect(axios.get).toHaveBeenCalledWith(
      "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/products",
      expect.objectContaining({
        headers: { Authorization: "bearer xyz" },
      })
    );
  });

  it("kutsuu create oikeilla parametreilla", async () => {
    const newProduct = { name: "Uusi" };
    axios.post.mockResolvedValue({ data: newProduct });

    ProductService.setToken("tok");
    const result = await ProductService.create(newProduct);

    expect(axios.post).toHaveBeenCalledWith(
      "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/products",
      newProduct,
      expect.objectContaining({
        headers: { Authorization: "bearer tok" },
      })
    );
    expect(result.data).toEqual(newProduct);
  });

  it("kutsuu remove oikeilla parametreilla", async () => {
    axios.delete.mockResolvedValue({ data: {} });

    ProductService.setToken("tok");
    await ProductService.remove(5);

    expect(axios.delete).toHaveBeenCalledWith(
      "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/products/5",
      expect.objectContaining({
        headers: { Authorization: "bearer tok" },
      })
    );
  });

  it("kutsuu update oikeilla parametreilla", async () => {
    const product = { productId: 10, name: "Updated" };
    axios.put.mockResolvedValue({ data: product });

    ProductService.setToken("tok");
    await ProductService.update(product);

    expect(axios.put).toHaveBeenCalledWith(
      "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/products/10",
      product,
      expect.objectContaining({
        headers: { Authorization: "bearer tok" },
      })
    );
  });

  it("kutsuu getById ja palauttaa datan", async () => {
    const product = { productId: 2, name: "Found" };
    axios.get.mockResolvedValue({ data: product });

    ProductService.setToken("tok");
    const result = await ProductService.getById(2);

    expect(axios.get).toHaveBeenCalledWith(
      "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/products/2",
      expect.objectContaining({
        headers: { Authorization: "bearer tok" },
      })
    );
    expect(result).toEqual(product);
  });
});
