// UserService.test.js
import axios from "axios";
import { vi, describe, it, beforeEach, expect } from "vitest";
import UserService from "./User"; // muuta polku oikein

vi.mock("axios");

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    UserService.setToken("123");
  });

  it("getAll hakee kaikki käyttäjät", async () => {
    const fakeUsers = [{ userId: 1, name: "Testi" }];
    axios.get.mockResolvedValue({ data: fakeUsers });

    const result = await UserService.getAll();

    expect(axios.get).toHaveBeenCalledWith("https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/users", {
      headers: { Authorization: "bearer 123" },
    });
    expect(result).toEqual(fakeUsers);
  });

  it("getById hakee yksittäisen käyttäjän", async () => {
    const fakeUser = { userId: 99, name: "Mikko" };
    axios.get.mockResolvedValue({ data: fakeUser });

    const result = await UserService.getById(99);

    expect(axios.get).toHaveBeenCalledWith("https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/users/99", {
      headers: { Authorization: "bearer 123" },
    });
    expect(result).toEqual(fakeUser);
  });

  it("create lisää uuden käyttäjän", async () => {
    const newUser = { name: "Uusi" };
    const fakeResponse = { data: { userId: 2, ...newUser } };
    axios.post.mockResolvedValue(fakeResponse);

    const result = await UserService.create(newUser);

    expect(axios.post).toHaveBeenCalledWith(
      "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/users",
      newUser,
      { headers: { Authorization: "bearer 123" } }
    );
    expect(result).toEqual(fakeResponse);
  });

  it("update muokkaa käyttäjää", async () => {
    const updateUser = { userId: 5, name: "Päivitetty" };
    const fakeResponse = { data: updateUser };
    axios.put.mockResolvedValue(fakeResponse);

    const result = await UserService.update(updateUser);

    expect(axios.put).toHaveBeenCalledWith(
      "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/users/5",
      updateUser,
      { headers: { Authorization: "bearer 123" } }
    );
    expect(result).toEqual(fakeResponse);
  });

  it("remove poistaa käyttäjän", async () => {
    const fakeResponse = { status: 200 };
    axios.delete.mockResolvedValue(fakeResponse);

    const result = await UserService.remove(7);

    expect(axios.delete).toHaveBeenCalledWith(
      "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/users/7",
      { headers: { Authorization: "bearer 123" } }
    );
    expect(result).toEqual(fakeResponse);
  });

  it("updatePassword päivittää käyttäjän salasanan", async () => {
    const fakeResponse = { status: 200 };
    axios.put.mockResolvedValue(fakeResponse);

    const result = await UserService.updatePassword({ userId: 10, password: "newpass" });

    expect(axios.put).toHaveBeenCalledWith(
      "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/users/10/password",
      { password: "newpass" },
      { headers: { Authorization: "bearer 123" } }
    );
    expect(result).toEqual(fakeResponse);
  });
});
