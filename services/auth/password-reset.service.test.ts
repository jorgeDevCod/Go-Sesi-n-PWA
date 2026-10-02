import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  InvalidResetTokenError,
  isResetTokenValid,
  requestPasswordReset,
  resetPasswordWithToken,
  ResetRateLimitedError,
} from "./password-reset.service";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    findUserByEmail: vi.fn(),
    findResetTokenByHash: vi.fn(),
    replaceResetTokenForUser: vi.fn(),
    markResetTokenUsed: vi.fn(),
    updateUserPassword: vi.fn(),
    send: vi.fn(),
    Resend: vi.fn(),
  },
}));

vi.mock("@/repositories/user.repository", () => ({
  findUserByEmail: mocks.findUserByEmail,
  updateUserPassword: mocks.updateUserPassword,
}));
vi.mock("@/repositories/password-reset.repository", () => ({
  findResetTokenByHash: mocks.findResetTokenByHash,
  replaceResetTokenForUser: mocks.replaceResetTokenForUser,
  markResetTokenUsed: mocks.markResetTokenUsed,
}));
vi.mock("resend", () => ({
  Resend: mocks.Resend,
}));

const NOW = new Date("2026-10-01T12:00:00.000Z");

describe("password-reset.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.RESEND_API_KEY;
    mocks.Resend.mockImplementation(function (this: { emails: unknown }) {
      this.emails = { send: mocks.send };
    });
  });

  it("correo desconocido responde genérico sin crear nada", async () => {
    mocks.findUserByEmail.mockResolvedValue(null);
    await expect(requestPasswordReset("nadie@x.com", NOW)).resolves.toEqual({ emailed: false });
    expect(mocks.replaceResetTokenForUser).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("sin API key crea token pero no envía", async () => {
    mocks.findUserByEmail.mockResolvedValue({ id: "u1", email: "a@x.com" });
    mocks.replaceResetTokenForUser.mockResolvedValue({ id: "t1" });
    await expect(requestPasswordReset("a@x.com", NOW)).resolves.toEqual({ emailed: false });
    expect(mocks.replaceResetTokenForUser).toHaveBeenCalledTimes(1);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("con API key envía el correo", async () => {
    process.env.RESEND_API_KEY = "test-key";
    mocks.findUserByEmail.mockResolvedValue({ id: "u1", email: "a@x.com" });
    mocks.replaceResetTokenForUser.mockResolvedValue({ id: "t1" });
    mocks.send.mockResolvedValue({ id: "mail-1" });
    await expect(requestPasswordReset("b@x.com", NOW)).resolves.toEqual({ emailed: true });
    expect(mocks.send).toHaveBeenCalledTimes(1);
    const arg = mocks.send.mock.calls[0][0];
    expect(arg.to).toBe("a@x.com");
    expect(arg.html).toContain("/reset-password/");
  });

  it("rate-limit por correo", async () => {
    mocks.findUserByEmail.mockResolvedValue(null);
    const email = `spam-${Date.now()}@x.com`;
    for (let i = 0; i < 5; i += 1) {
      await requestPasswordReset(email, NOW);
    }
    await expect(requestPasswordReset(email, NOW)).rejects.toBeInstanceOf(ResetRateLimitedError);
  });

  it("token válido cambia la contraseña y gasta el enlace", async () => {
    mocks.findResetTokenByHash.mockResolvedValue({
      id: "t1",
      userId: "u1",
      usedAt: null,
      expiresAt: new Date(NOW.getTime() + 1000),
    });
    mocks.markResetTokenUsed.mockResolvedValue({});
    mocks.updateUserPassword.mockResolvedValue({});
    await resetPasswordWithToken("plano", "Nueva-1234!x", NOW);
    expect(mocks.markResetTokenUsed).toHaveBeenCalledWith("t1", NOW);
    expect(mocks.updateUserPassword).toHaveBeenCalledWith(
      "u1",
      expect.not.stringContaining("Nueva-1234!x"),
    );
  });

  it("expirado, usado o inexistente lanzan", async () => {
    mocks.findResetTokenByHash.mockResolvedValueOnce(null);
    await expect(resetPasswordWithToken("x", "Nueva-1234!x", NOW)).rejects.toBeInstanceOf(
      InvalidResetTokenError,
    );
    mocks.findResetTokenByHash.mockResolvedValueOnce({
      id: "t1",
      userId: "u1",
      usedAt: new Date(),
      expiresAt: new Date(NOW.getTime() + 1000),
    });
    await expect(resetPasswordWithToken("x", "Nueva-1234!x", NOW)).rejects.toBeInstanceOf(
      InvalidResetTokenError,
    );
    mocks.findResetTokenByHash.mockResolvedValueOnce({
      id: "t1",
      userId: "u1",
      usedAt: null,
      expiresAt: new Date(NOW.getTime() - 1000),
    });
    await expect(resetPasswordWithToken("x", "Nueva-1234!x", NOW)).rejects.toBeInstanceOf(
      InvalidResetTokenError,
    );
    expect(mocks.updateUserPassword).not.toHaveBeenCalled();
  });

  it("isResetTokenValid refleja vigencia", async () => {
    mocks.findResetTokenByHash.mockResolvedValueOnce({
      usedAt: null,
      expiresAt: new Date(NOW.getTime() + 1000),
    });
    await expect(isResetTokenValid("x", NOW)).resolves.toBe(true);
    mocks.findResetTokenByHash.mockResolvedValueOnce(null);
    await expect(isResetTokenValid("x", NOW)).resolves.toBe(false);
  });
});
