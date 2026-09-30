import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import {
  users,
  suppliers,
  products,
  locations,
  requests,
  auditLogs,
} from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";

const DEFAULT_USERS = [
  {
    username: "mehmet_cem_yagsi",
    password: "17021987",
    displayName: "Mehmet Cem Yağsı",
    role: "ADMIN",
    supplier: null,
    loadPerm: "ALL",
    permissions: {
      canCreateTrip: true,
      canAssignPlate: true,
      canRevokePlate: true,
      canScale: true,
      canUploadDelivery: true,
      canCancelTrip: true,
      canExport: true,
      canViewScorecard: true,
      canViewAudit: true,
      canAccessAdmin: true,
    },
  },
];

const DEFAULT_SUPPLIERS = [
  { id: "SUP-1", name: "Elita Lojistik A.Ş.", loadType: "HER_IKISI", contact: "Yetkili Temsilci", phone: "0532 000 00 00" },
  { id: "SUP-2", name: "Akdeniz Tanker Taşımacılık", loadType: "DOKME", contact: "Tanker Operasyon", phone: "0533 000 00 00" },
  { id: "SUP-3", name: "Toroslar Filo Dağıtım", loadType: "AMBALAJLI", contact: "Filo Yönetimi", phone: "0535 000 00 00" },
  { id: "SUP-4", name: "Çukurova Hızlı Nakliyat", loadType: "HER_IKISI", contact: "Nakliye Masası", phone: "0542 000 00 00" },
];

const DEFAULT_PRODUCTS = [
  { id: "PRD-1", name: "Rafine Ayçiçek Yağı (5L Pet / Koli)", category: "AMBALAJLI" },
  { id: "PRD-2", name: "Rafine Ayçiçek Yağı (18L Teneke)", category: "AMBALAJLI" },
  { id: "PRD-3", name: "Ham Ayçiçek Yağı (Dökme Tanker)", category: "DOKME" },
  { id: "PRD-4", name: "Rafine Mısır Yağı (Dökme Tanker)", category: "DOKME" },
  { id: "PRD-5", name: "Paketli Koli Yağ Karma Palet", category: "AMBALAJLI" },
  { id: "PRD-6", name: "Ayçiçek Küspesi / Pelet", category: "DOKME" },
];

const DEFAULT_LOCATIONS = [
  { id: "LOC-1", name: "Elita Gıda Adana Fabrika (Merkez Tesis)", type: "ORIGIN" },
  { id: "LOC-2", name: "Elita Mersin Liman Deposu", type: "ORIGIN" },
  { id: "LOC-3", name: "İstanbul Anadolu Ana Lojistik Depo (Tuzla)", type: "DROP" },
  { id: "LOC-4", name: "Ankara Gıda Toptancılar Hali 1. Kısım", type: "DROP" },
  { id: "LOC-5", name: "İzmir Işıkkent Dağıtım Merkezi", type: "DROP" },
  { id: "LOC-6", name: "Bursa Nilüfer Perakende Zincir Deposu", type: "DROP" },
];

async function ensureSeedData() {
  try {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length === 0) {
      await db.insert(users).values(DEFAULT_USERS);
      await db.insert(suppliers).values(DEFAULT_SUPPLIERS);
      await db.insert(products).values(DEFAULT_PRODUCTS);
      await db.insert(locations).values(DEFAULT_LOCATIONS);
    }
  } catch (err) {
    console.error("Seed check error:", err);
  }
}

function sanitizeRequestForDb(data: any) {
  const r: any = { ...data };
  if (!r.id) {
    r.id = "REQ-" + Date.now();
  }
  if (!r.talepNo) {
    r.talepNo = "ELT-2026-" + Date.now().toString().slice(-4);
  }
  if (r.updatedAt) {
    r.updatedAt = new Date(r.updatedAt);
  } else {
    r.updatedAt = new Date();
  }
  if (r.revokeCount !== undefined && r.revokeCount !== null) {
    r.revokeCount = Number(r.revokeCount) || 0;
  }
  if (r.hasRevocation !== undefined && r.hasRevocation !== null) {
    r.hasRevocation = Boolean(r.hasRevocation);
  }
  return r;
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const pathname = url.pathname.replace(/^\/\.netlify\/functions\/api/, "/api");
  const method = req.method.toUpperCase();

  // Ensure initial data seeded on first access
  await ensureSeedData();

  try {
    // GET /api/data -> Get all data for synchronization
    if (method === "GET" && (pathname === "/api/data" || pathname === "/api/sync")) {
      const allUsers = await db.select().from(users);
      const allSuppliers = await db.select().from(suppliers);
      const allProducts = await db.select().from(products);
      const allLocations = await db.select().from(locations);
      const allRequests = await db.select().from(requests).orderBy(desc(requests.updatedAt));
      const allLogs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(200);

      return Response.json({
        success: true,
        users: allUsers,
        suppliers: allSuppliers,
        products: allProducts,
        locations: allLocations,
        requests: allRequests,
        auditLogs: allLogs,
      });
    }

    // POST /api/requests -> Create new trip request
    if (method === "POST" && pathname === "/api/requests") {
      const rawBody = await req.json();
      const body = sanitizeRequestForDb(rawBody);
      const [inserted] = await db.insert(requests).values(body).returning();
      return Response.json({ success: true, request: inserted }, { status: 201 });
    }

    // PUT /api/requests/:id -> Update trip request
    if (method === "PUT" && pathname.startsWith("/api/requests/")) {
      const id = decodeURIComponent(pathname.replace("/api/requests/", ""));
      const rawBody = await req.json();
      const body = sanitizeRequestForDb(rawBody);
      delete body.id; // avoid mutating primary key
      body.updatedAt = new Date();
      const [updated] = await db
        .update(requests)
        .set(body)
        .where(eq(requests.id, id))
        .returning();
      return Response.json({ success: true, request: updated });
    }

    // DELETE /api/requests/:id -> Delete trip request
    if (method === "DELETE" && pathname.startsWith("/api/requests/")) {
      const id = decodeURIComponent(pathname.replace("/api/requests/", ""));
      await db.delete(requests).where(eq(requests.id, id));
      return Response.json({ success: true, id });
    }

    // USERS
    if (method === "POST" && pathname === "/api/users") {
      const body = await req.json();
      const [inserted] = await db.insert(users).values(body).returning();
      return Response.json({ success: true, user: inserted }, { status: 201 });
    }

    if (method === "PUT" && pathname.startsWith("/api/users/")) {
      const username = decodeURIComponent(pathname.replace("/api/users/", ""));
      const body = await req.json();
      delete body.username;
      body.updatedAt = new Date();
      const [updated] = await db
        .update(users)
        .set(body)
        .where(eq(users.username, username))
        .returning();
      return Response.json({ success: true, user: updated });
    }

    if (method === "DELETE" && pathname.startsWith("/api/users/")) {
      const username = decodeURIComponent(pathname.replace("/api/users/", ""));
      await db.delete(users).where(eq(users.username, username));
      return Response.json({ success: true, username });
    }

    // SUPPLIERS
    if (method === "POST" && pathname === "/api/suppliers") {
      const body = await req.json();
      const [inserted] = await db.insert(suppliers).values(body).returning();
      return Response.json({ success: true, supplier: inserted }, { status: 201 });
    }

    if (method === "PUT" && pathname.startsWith("/api/suppliers/")) {
      const id = decodeURIComponent(pathname.replace("/api/suppliers/", ""));
      const body = await req.json();
      delete body.id;
      body.updatedAt = new Date();
      const [updated] = await db
        .update(suppliers)
        .set(body)
        .where(eq(suppliers.id, id))
        .returning();
      return Response.json({ success: true, supplier: updated });
    }

    if (method === "DELETE" && pathname.startsWith("/api/suppliers/")) {
      const id = decodeURIComponent(pathname.replace("/api/suppliers/", ""));
      await db.delete(suppliers).where(eq(suppliers.id, id));
      return Response.json({ success: true, id });
    }

    // PRODUCTS
    if (method === "POST" && pathname === "/api/products") {
      const body = await req.json();
      const [inserted] = await db.insert(products).values(body).returning();
      return Response.json({ success: true, product: inserted }, { status: 201 });
    }

    if (method === "PUT" && pathname.startsWith("/api/products/")) {
      const id = decodeURIComponent(pathname.replace("/api/products/", ""));
      const body = await req.json();
      delete body.id;
      body.updatedAt = new Date();
      const [updated] = await db
        .update(products)
        .set(body)
        .where(eq(products.id, id))
        .returning();
      return Response.json({ success: true, product: updated });
    }

    if (method === "DELETE" && pathname.startsWith("/api/products/")) {
      const id = decodeURIComponent(pathname.replace("/api/products/", ""));
      await db.delete(products).where(eq(products.id, id));
      return Response.json({ success: true, id });
    }

    // LOCATIONS
    if (method === "POST" && pathname === "/api/locations") {
      const body = await req.json();
      const [inserted] = await db.insert(locations).values(body).returning();
      return Response.json({ success: true, location: inserted }, { status: 201 });
    }

    if (method === "PUT" && pathname.startsWith("/api/locations/")) {
      const id = decodeURIComponent(pathname.replace("/api/locations/", ""));
      const body = await req.json();
      delete body.id;
      body.updatedAt = new Date();
      const [updated] = await db
        .update(locations)
        .set(body)
        .where(eq(locations.id, id))
        .returning();
      return Response.json({ success: true, location: updated });
    }

    if (method === "DELETE" && pathname.startsWith("/api/locations/")) {
      const id = decodeURIComponent(pathname.replace("/api/locations/", ""));
      await db.delete(locations).where(eq(locations.id, id));
      return Response.json({ success: true, id });
    }

    // AUDIT LOGS
    if (method === "POST" && pathname === "/api/audit-logs") {
      const body = await req.json();
      const [inserted] = await db.insert(auditLogs).values(body).returning();
      return Response.json({ success: true, log: inserted }, { status: 201 });
    }

    // Client migration/seeding of existing local requests if DB has none
    if (method === "POST" && pathname === "/api/seed-from-client") {
      const body = await req.json();
      const currentReqs = await db.select().from(requests).limit(1);
      if (currentReqs.length === 0 && Array.isArray(body.requests) && body.requests.length > 0) {
        for (const rawR of body.requests) {
          try {
            const r = sanitizeRequestForDb(rawR);
            await db.insert(requests).values(r);
          } catch (e) {
            console.error("Error migrating request:", e);
          }
        }
      }
      return Response.json({ success: true });
    }

    return new Response("Not Found", { status: 404 });
  } catch (error: any) {
    console.error("API error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/*",
};
