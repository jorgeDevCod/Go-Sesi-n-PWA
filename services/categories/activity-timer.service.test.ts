import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveActivityTimerPreferenceForUser } from "./activity-timer.service";
import {
  SubcategoryForbiddenError,
  SubcategoryNotFoundError,
} from "./subcategory.errors";

const { mocks } = vi.hoisted(() => ({
  mocks: {
    findSubcategoryById: vi.fn(),
    updateSubcategoryTimerPreference: vi.fn(),
  },
}));

vi.mock("@/repositories/subcategory.repository", () => ({
  findSubcategoryById: mocks.findSubcategoryById,
  updateSubcategoryTimerPreference: mocks.updateSubcategoryTimerPreference,
}));

const config = {
  focusMin: 50,
  breakMin: 10,
  cycles: 3,
  autoStart: false,
};

describe("saveActivityTimerPreferenceForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findSubcategoryById.mockResolvedValue({ id: "sub-1", userId: "user-1" });
  });

  it("guarda el último tiempo clásico y el modo", async () => {
    await saveActivityTimerPreferenceForUser("user-1", {
      id: "sub-1",
      mode: "CLASSIC",
      classicMinutes: 45,
    });

    expect(mocks.updateSubcategoryTimerPreference).toHaveBeenCalledWith("sub-1", {
      lastMode: "CLASSIC",
      lastClassicMinutes: 45,
    });
  });

  it("guarda la configuración pomodoro y el modo", async () => {
    await saveActivityTimerPreferenceForUser("user-1", {
      id: "sub-1",
      mode: "POMODORO",
      pomodoroConfig: config,
    });

    expect(mocks.updateSubcategoryTimerPreference).toHaveBeenCalledWith("sub-1", {
      lastMode: "POMODORO",
      pomodoroConfig: config,
    });
  });

  it("rechaza actividades de otro usuario", async () => {
    mocks.findSubcategoryById.mockResolvedValue({ id: "sub-1", userId: "otro" });
    await expect(
      saveActivityTimerPreferenceForUser("user-1", {
        id: "sub-1",
        mode: "CLASSIC",
        classicMinutes: 30,
      }),
    ).rejects.toBeInstanceOf(SubcategoryForbiddenError);
    expect(mocks.updateSubcategoryTimerPreference).not.toHaveBeenCalled();
  });

  it("rechaza actividades inexistentes", async () => {
    mocks.findSubcategoryById.mockResolvedValue(null);
    await expect(
      saveActivityTimerPreferenceForUser("user-1", {
        id: "sub-1",
        mode: "CLASSIC",
        classicMinutes: 30,
      }),
    ).rejects.toBeInstanceOf(SubcategoryNotFoundError);
  });
});
