import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  invoiceFindUniqueMock,
  invoiceUpdateMock,
  checkoutCreateMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  invoiceFindUniqueMock: vi.fn(),
  invoiceUpdateMock: vi.fn(),
  checkoutCreateMock: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    invoice: {
      findUnique: invoiceFindUniqueMock,
      update: invoiceUpdateMock,
    },
  },
}));

vi.mock("stripe", () => ({
  default: vi.fn(function StripeMock() {
    return {
      checkout: {
        sessions: {
          create: checkoutCreateMock,
        },
      },
    };
  }),
}));

import { POST } from "./route";

function createRequest(body: unknown) {
  return {
    json: async () => body,
  } as Request;
}

describe("POST /api/stripe/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.AUTH_SECRET = "secret";
  });

  it("returns 401 when unauthenticated and not internal", async () => {
    authMock.mockResolvedValue(null);

    const response = await POST(createRequest({ invoiceId: "inv_1" }) as never);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 403 when client does not own invoice", async () => {
    authMock.mockResolvedValue({ user: { id: "client_1", role: "CLIENT" } });
    invoiceFindUniqueMock.mockResolvedValue({
      id: "inv_1",
      status: "SENT",
      totalAmount: 100,
      invoiceNumber: "NY-2026-0001",
      client: {
        userId: "client_2",
        companyName: "Acme",
        email: "billing@acme.com",
      },
    });

    const response = await POST(createRequest({ invoiceId: "inv_1" }) as never);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Forbidden" });
  });

  it("creates checkout and marks draft invoice as sent", async () => {
    authMock.mockResolvedValue({ user: { id: "admin_1", role: "ADMIN" } });
    invoiceFindUniqueMock.mockResolvedValue({
      id: "inv_1",
      status: "DRAFT",
      totalAmount: 125.5,
      invoiceNumber: "NY-2026-0002",
      client: {
        userId: "client_1",
        companyName: "Acme",
        email: "billing@acme.com",
      },
    });
    checkoutCreateMock.mockResolvedValue({
      id: "cs_test_1",
      url: "https://checkout.stripe.com/test",
    });
    invoiceUpdateMock.mockResolvedValue({});

    const response = await POST(createRequest({ invoiceId: "inv_1" }) as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "https://checkout.stripe.com/test" });

    expect(checkoutCreateMock).toHaveBeenCalledTimes(1);
    expect(invoiceUpdateMock).toHaveBeenCalledWith({
      where: { id: "inv_1" },
      data: expect.objectContaining({
        stripeCheckoutSessionId: "cs_test_1",
        stripePaymentUrl: "https://checkout.stripe.com/test",
        status: "SENT",
      }),
    });
  });
});
