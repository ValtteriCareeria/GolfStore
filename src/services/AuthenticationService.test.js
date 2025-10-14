// AuthenticationService.test.js
import axios from "axios";
import { vi, describe, it, expect } from "vitest";
import AuthenticationService from "./Auth"; // säädä polku tarpeen mukaan

vi.mock("axios");

describe("AuthenticationService", () => {
  it("onnistuu kun axios palauttaa tokenin", async () => {
    const fakeUser = { username: "test", password: "secret" };
    const fakeResponse = { data: { token: "abc123" } };

    // Mockataan axios.post palauttamaan promise
    axios.post.mockResolvedValue(fakeResponse);

    const response = await AuthenticationService.authenticate(fakeUser);

    expect(axios.post).toHaveBeenCalledWith(
      "https://golfstore20251008143256-c0gbbtahgda8bdf5.northeurope-01.azurewebsites.net/api/authentication",
      fakeUser
    );
    expect(response).toEqual(fakeResponse);
  });

  it("palauttaa virheen kun axios epäonnistuu", async () => {
    const fakeUser = { username: "bad", password: "wrong" };
    const error = new Error("Unauthorized");

    axios.post.mockRejectedValue(error);

    await expect(AuthenticationService.authenticate(fakeUser)).rejects.toThrow(
      "Unauthorized"
    );
  });
});
