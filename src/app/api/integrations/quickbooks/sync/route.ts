import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ── QBO API helpers ────────────────────────────────────────────────────────────

const QBO_BASE = (realmId: string) => {
  const env = process.env.QUICKBOOKS_ENV === "production"
    ? "https://quickbooks.api.intuit.com"
    : "https://sandbox-quickbooks.api.intuit.com";
  return `${env}/v3/company/${realmId}`;
};

interface QBOAccount {
  userId:            string;
  providerAccountId: string; // realmId
  access_token:      string | null;
  refresh_token:     string | null;
  expires_at:        number | null;
}

async function refreshQBOToken(account: QBOAccount): Promise<string> {
  const clientId     = process.env.QUICKBOOKS_CLIENT_ID ?? "";
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET ?? "";

  const now = Math.floor(Date.now() / 1000);
  // If access token is still valid (with 60-second buffer), use it
  if (account.access_token && account.expires_at && account.expires_at - 60 > now) {
    return account.access_token;
  }

  if (!account.refresh_token) throw new Error("No refresh token — reconnect QuickBooks");

  const res = await fetch(
    "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    {
      method:  "POST",
      headers: {
        "Content-Type":  "application/x-www-form-urlencoded",
        "Accept":        "application/json",
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type:    "refresh_token",
        refresh_token: account.refresh_token,
      }),
    }
  );

  if (!res.ok) throw new Error(`QBO token refresh failed: ${await res.text()}`);

  const data = await res.json() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };

  const expiresAt = now + data.expires_in;

  await prisma.account.update({
    where: {
      provider_providerAccountId: { provider: "quickbooks", providerAccountId: account.providerAccountId },
    },
    data: {
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expires_at:    expiresAt,
    },
  });

  return data.access_token;
}

async function qboFetch(
  method: "GET" | "POST",
  url: string,
  token: string,
  body?: unknown
): Promise<unknown> {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization:  `Bearer ${token}`,
      Accept:         "application/json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QBO API error ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

// ── Find or create QBO Customer ────────────────────────────────────────────────

async function findOrCreateCustomer(
  realmId: string,
  token: string,
  clientId: string,
  companyName: string,
  email: string | null,
  phone: string | null,
): Promise<string> {
  // Check if we already have a qboCustomerId stored
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { qboCustomerId: true },
  });

  if (client?.qboCustomerId) return client.qboCustomerId;

  // Query QBO for an existing customer by display name
  const queryUrl = `${QBO_BASE(realmId)}/query?query=${encodeURIComponent(
    `SELECT * FROM Customer WHERE DisplayName = '${companyName.replace(/'/g, "\\'")}' MAXRESULTS 1`
  )}&minorversion=65`;

  const queryData = await qboFetch("GET", queryUrl, token) as {
    QueryResponse: { Customer?: { Id: string }[] };
  };
  const existing = queryData.QueryResponse.Customer;
  if (existing && existing.length > 0) {
    const qboId = existing[0].Id;
    await prisma.client.update({ where: { id: clientId }, data: { qboCustomerId: qboId } });
    return qboId;
  }

  // Create new customer
  const customerData: Record<string, unknown> = { DisplayName: companyName };
  if (email) customerData.PrimaryEmailAddr = { Address: email };
  if (phone) customerData.PrimaryPhone = { FreeFormNumber: phone };

  const createData = await qboFetch(
    "POST",
    `${QBO_BASE(realmId)}/customer?minorversion=65`,
    token,
    customerData
  ) as { Customer: { Id: string } };

  const qboCustomerId = createData.Customer.Id;
  await prisma.client.update({ where: { id: clientId }, data: { qboCustomerId } });
  return qboCustomerId;
}

// ── POST /api/integrations/quickbooks/sync ─────────────────────────────────────

interface SyncResult {
  synced:   number;
  skipped:  number;
  errors:   string[];
}

/**
 * POST /api/integrations/quickbooks/sync
 * Pushes all SENT + PAID + OVERDUE invoices that haven't been synced yet to QBO.
 * Safely idempotent — invoices with a qboId are skipped.
 */
export async function POST(_req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find QBO account
  const account = await prisma.account.findFirst({
    where: { provider: "quickbooks" },
    orderBy: { expires_at: "desc" },
  });

  if (!account) {
    return NextResponse.json({ error: "QuickBooks not connected" }, { status: 400 });
  }

  let token: string;
  try {
    token = await refreshQBOToken(account as QBOAccount);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }

  const realmId = account.providerAccountId;

  // Fetch unsynced invoices
  const invoices = await prisma.invoice.findMany({
    where: {
      status:  { in: ["SENT", "PAID", "OVERDUE"] },
      qboId:   null,
    },
    include: {
      client: {
        select: {
          id:            true,
          companyName:   true,
          email:         true,
          phone:         true,
          qboCustomerId: true,
        },
      },
    },
  });

  const result: SyncResult = { synced: 0, skipped: 0, errors: [] };

  for (const inv of invoices) {
    try {
      // Find or create QBO customer
      const qboCustomerId = await findOrCreateCustomer(
        realmId,
        token,
        inv.client.id,
        inv.client.companyName,
        inv.client.email,
        inv.client.phone,
      );

      // Parse line items from JSON or fall back to a single service line
      const lineItems: { description: string; qty: number; unitPrice: number }[] =
        Array.isArray(inv.lineItems)
          ? (inv.lineItems as { description?: string; qty?: number; unitPrice?: number }[]).map((li) => ({
              description: li.description ?? "Aerial Services",
              qty:         li.qty ?? 1,
              unitPrice:   li.unitPrice ?? Number(inv.totalAmount),
            }))
          : [{ description: `Job: ${inv.invoiceNumber}`, qty: 1, unitPrice: Number(inv.totalAmount) }];

      const txnDate = (inv.issueDate ?? inv.createdAt).toISOString().split("T")[0];
      const dueDate = inv.dueDate ? inv.dueDate.toISOString().split("T")[0] : undefined;

      const qboInvoice: Record<string, unknown> = {
        DocNumber:   inv.invoiceNumber,
        TxnDate:     txnDate,
        CustomerRef: { value: qboCustomerId },
        Line: lineItems.map((li) => ({
          Amount:           li.qty * li.unitPrice,
          DetailType:       "SalesItemLineDetail",
          Description:      li.description,
          SalesItemLineDetail: {
            ItemRef:  { value: "1", name: "Services" }, // default services item
            Qty:      li.qty,
            UnitPrice: li.unitPrice,
          },
        })),
      };
      if (dueDate) qboInvoice.DueDate = dueDate;

      const createRes = await qboFetch(
        "POST",
        `${QBO_BASE(realmId)}/invoice?minorversion=65`,
        token,
        qboInvoice
      ) as { Invoice: { Id: string } };

      const qboId = createRes.Invoice.Id;

      // Mark invoice as synced
      await prisma.invoice.update({ where: { id: inv.id }, data: { qboId } });

      // If invoice is PAID, mark it payment received in QBO
      if (inv.status === "PAID" && inv.paidAt) {
        const paymentPayload = {
          CustomerRef: { value: qboCustomerId },
          TxnDate:     inv.paidAt.toISOString().split("T")[0],
          TotalAmt:    Number(inv.totalAmount),
          Line: [{
            Amount:      Number(inv.totalAmount),
            LinkedTxn:   [{ TxnId: qboId, TxnType: "Invoice" }],
          }],
        };
        try {
          await qboFetch("POST", `${QBO_BASE(realmId)}/payment?minorversion=65`, token, paymentPayload);
        } catch {
          // Payment recording is best-effort — invoice was still synced
        }
      }

      result.synced++;
    } catch (err) {
      result.errors.push(`${inv.invoiceNumber}: ${String(err).slice(0, 120)}`);
      result.skipped++;
    }
  }

  return NextResponse.json(result);
}

// ── GET /api/integrations/quickbooks/sync — return current sync status ─────────

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.account.findFirst({
    where: { provider: "quickbooks" },
    orderBy: { expires_at: "desc" },
    select: { providerAccountId: true, expires_at: true, access_token: true },
  });

  if (!account) return NextResponse.json({ connected: false });

  const syncedCount = await prisma.invoice.count({ where: { qboId: { not: null } } });
  const unsyncedCount = await prisma.invoice.count({
    where: { status: { in: ["SENT", "PAID", "OVERDUE"] }, qboId: null },
  });

  return NextResponse.json({
    connected:      true,
    realmId:        account.providerAccountId,
    tokenExpired:   account.expires_at ? account.expires_at < Math.floor(Date.now() / 1000) : false,
    syncedCount,
    unsyncedCount,
  });
}
