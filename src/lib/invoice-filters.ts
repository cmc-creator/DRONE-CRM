import { Prisma } from "@prisma/client";

type InvoiceFilterInput = {
  q?: string;
  status?: string;
};

export function buildInvoiceWhere({ q, status }: InvoiceFilterInput): Prisma.InvoiceWhereInput {
  const search = q?.trim();
  const trimmedStatus = status?.trim();

  return {
    ...(trimmedStatus ? { status: trimmedStatus as never } : {}),
    ...(search
      ? {
          OR: [
            { invoiceNumber: { contains: search, mode: "insensitive" } },
            { client: { companyName: { contains: search, mode: "insensitive" } } },
            { job: { title: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
}
