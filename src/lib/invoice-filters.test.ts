import { describe, expect, it } from "vitest";
import { buildInvoiceWhere } from "@/lib/invoice-filters";

describe("buildInvoiceWhere", () => {
  it("builds status and search filters when provided", () => {
    const where = buildInvoiceWhere({ q: "acme", status: "SENT" });

    expect(where).toMatchObject({
      status: "SENT",
      OR: [
        { invoiceNumber: { contains: "acme", mode: "insensitive" } },
        { client: { companyName: { contains: "acme", mode: "insensitive" } } },
        { job: { title: { contains: "acme", mode: "insensitive" } } },
      ],
    });
  });

  it("returns an empty where object when filters are blank", () => {
    const where = buildInvoiceWhere({ q: "   ", status: "" });
    expect(where).toEqual({});
  });
});
