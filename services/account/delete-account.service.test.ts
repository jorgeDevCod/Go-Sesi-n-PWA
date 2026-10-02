import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { deleteAccountForUser } from "./delete-account.service";
import { AccountInvalidPasswordError, AccountNotFoundError } from "./account.errors";

const { mocks } = vi.hoisted(() => ({
  mocks: { findUserById: vi.fn(), deleteUser: vi.fn() },
}));

vi.mock("@/repositories/user.repository", () => ({
  findUserById: mocks.findUserById,
  deleteUser: mocks.deleteUser,
}));

describe("deleteAccountForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("con contraseña correcta elimina la cuenta", async () => {
    mocks.findUserById.mockResolvedValue({
      id: "u1",
      passwordHash: await bcrypt.hash("clave123", 4),
    });
    mocks.deleteUser.mockResolvedValue({ id: "u1" });
    await deleteAccountForUser("u1", "clave123");
    expect(mocks.deleteUser).toHaveBeenCalledWith("u1");
  });

  it("con contraseña incorrecta no borra nada", async () => {
    mocks.findUserById.mockResolvedValue({
      id: "u1",
      passwordHash: await bcrypt.hash("clave123", 4),
    });
    await expect(deleteAccountForUser("u1", "otra")).rejects.toBeInstanceOf(
      AccountInvalidPasswordError,
    );
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it("cuenta inexistente lanza error", async () => {
    mocks.findUserById.mockResolvedValue(null);
    await expect(deleteAccountForUser("nope", "x")).rejects.toBeInstanceOf(AccountNotFoundError);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });
});
