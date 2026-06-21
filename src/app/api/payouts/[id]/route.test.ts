import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  paymentFindUniqueMock,
  paymentUpdateMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  paymentFindUniqueMock: vi.fn(),
  paymentUpdateMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pilotPayment: {
      findUnique: paymentFindUniqueMock,
      update: paymentUpdateMock,
    },
  },
}));

import { PATCH } from "./route";

function createRequest(body: unknown) {
  return {
    json: async () => body,
  } as Request;
}

describe("PATCH /api/payouts/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not admin", async () => {
    authMock.mockResolvedValue(null);

    const response = await PATCH(createRequest({ status: "APPROVED" }) as never, {
      params: Promise.resolve({ id: "pay_1" }),
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("sets approvedAt when moving into APPROVED", async () => {
    authMock.mockResolvedValue({ user: { role: "ADMIN" } });
    paymentFindUniqueMock.mockResolvedValue({ id: "pay_1", status: "PENDING" });
    paymentUpdateMock.mockResolvedValue({ id: "pay_1", status: "APPROVED" });

    const response = await PATCH(createRequest({ status: "APPROVED" }) as never, {
      params: Promise.resolve({ id: "pay_1" }),
    });

    expect(response.status).toBe(200);
    expect(paymentUpdateMock).toHaveBeenCalledWith({
      where: { id: "pay_1" },
      data: expect.objectContaining({
        status: "APPROVED",
        approvedAt: expect.any(Date),
        paidAt: null,
      }),
    });
  });

  it("clears approvedAt when moving out of APPROVED", async () => {
    authMock.mockResolvedValue({ user: { role: "ADMIN" } });
    paymentFindUniqueMock.mockResolvedValue({ id: "pay_1", status: "APPROVED" });
    paymentUpdateMock.mockResolvedValue({ id: "pay_1", status: "PENDING" });

    const response = await PATCH(createRequest({ status: "PENDING" }) as never, {
      params: Promise.resolve({ id: "pay_1" }),
    });

    expect(response.status).toBe(200);
    expect(paymentUpdateMock).toHaveBeenCalledWith({
      where: { id: "pay_1" },
      data: expect.objectContaining({
        status: "PENDING",
        approvedAt: null,
      }),
    });
  });
});
