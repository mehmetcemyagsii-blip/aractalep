import { pgTable, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  username: text("username").primaryKey(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull(),
  supplier: text("supplier"),
  loadPerm: text("load_perm").default("ALL"),
  permissions: jsonb("permissions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  loadType: text("load_type").notNull(),
  contact: text("contact").default(""),
  phone: text("phone").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const locations = pgTable("locations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const requests = pgTable("requests", {
  id: text("id").primaryKey(),
  talepNo: text("talep_no").notNull().unique(),
  priority: text("priority").default("NORMAL"),
  loadType: text("load_type").default("AMBALAJLI"),
  supplier: text("supplier").notNull(),
  loadDate: text("load_date").default(""),
  vehicleType: text("vehicle_type").default(""),
  origin: text("origin").default(""),
  drop1: text("drop_1").default(""),
  drop2: text("drop_2").default(""),
  drop3: text("drop_3").default(""),
  drop4: text("drop_4").default(""),
  productName: text("product_name").default(""),
  quantity: text("quantity").default(""),
  palletCount: text("pallet_count").default(""),
  notes: text("notes").default(""),
  status: text("status").default("BEKLIYOR"),
  truckPlate: text("truck_plate").default(""),
  trailerPlate: text("trailer_plate").default(""),
  driverName: text("driver_name").default(""),
  driverPhone: text("driver_phone").default(""),
  driverIdNumber: text("driver_id_number").default(""),
  eta: text("eta").default(""),
  factoryEntryDate: text("factory_entry_date").default(""),
  scaleGrossWeight: text("scale_gross_weight").default(""),
  scaleTicketNote: text("scale_ticket_note").default(""),
  deliveryDocUrl: text("delivery_doc_url"),
  deliveryDocName: text("delivery_doc_name").default(""),
  receiverName: text("receiver_name").default(""),
  lastEditReason: text("last_edit_reason"),
  revokeReason: text("revoke_reason"),
  revokeCount: integer("revoke_count").default(0),
  hasRevocation: boolean("has_revocation").default(false),
  cancelReason: text("cancel_reason"),
  createdAt: text("created_at").default(""),
  createdBy: text("created_by").default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  timestamp: text("timestamp").notNull(),
  user: text("user").notNull(),
  action: text("action").notNull(),
  talepNo: text("talep_no").default("-"),
  details: text("details").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});
