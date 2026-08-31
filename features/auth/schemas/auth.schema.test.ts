import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/features/auth/schemas/auth.schema";

describe("registerSchema", () => {
  const valid = {
    name: "Usuario",
    email: "usuario@example.com",
    password: "Abcdef12",
    confirmPassword: "Abcdef12",
  };

  it("accepts a valid payload", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "Ab1",
      confirmPassword: "Ab1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password missing complexity requirements", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "alllowercase",
      confirmPassword: "alllowercase",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched confirmPassword", () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: "Different12",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a valid payload", () => {
    expect(
      loginSchema.safeParse({ email: "usuario@example.com", password: "anything" })
        .success,
    ).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(
      loginSchema.safeParse({ email: "usuario@example.com", password: "" }).success,
    ).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(
      loginSchema.safeParse({ email: "nope", password: "anything" }).success,
    ).toBe(false);
  });
});
