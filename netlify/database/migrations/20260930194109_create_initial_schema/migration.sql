CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY,
	"timestamp" text NOT NULL,
	"user" text NOT NULL,
	"action" text NOT NULL,
	"talep_no" text DEFAULT '-',
	"details" text DEFAULT '',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" text PRIMARY KEY,
	"talep_no" text NOT NULL UNIQUE,
	"priority" text DEFAULT 'NORMAL',
	"load_type" text DEFAULT 'AMBALAJLI',
	"supplier" text NOT NULL,
	"load_date" text DEFAULT '',
	"vehicle_type" text DEFAULT '',
	"origin" text DEFAULT '',
	"drop_1" text DEFAULT '',
	"drop_2" text DEFAULT '',
	"drop_3" text DEFAULT '',
	"drop_4" text DEFAULT '',
	"product_name" text DEFAULT '',
	"quantity" text DEFAULT '',
	"pallet_count" text DEFAULT '',
	"notes" text DEFAULT '',
	"status" text DEFAULT 'BEKLIYOR',
	"truck_plate" text DEFAULT '',
	"trailer_plate" text DEFAULT '',
	"driver_name" text DEFAULT '',
	"driver_phone" text DEFAULT '',
	"driver_id_number" text DEFAULT '',
	"eta" text DEFAULT '',
	"factory_entry_date" text DEFAULT '',
	"scale_gross_weight" text DEFAULT '',
	"scale_ticket_note" text DEFAULT '',
	"delivery_doc_url" text,
	"delivery_doc_name" text DEFAULT '',
	"receiver_name" text DEFAULT '',
	"last_edit_reason" text,
	"revoke_reason" text,
	"revoke_count" integer DEFAULT 0,
	"has_revocation" boolean DEFAULT false,
	"cancel_reason" text,
	"created_at" text DEFAULT '',
	"created_by" text DEFAULT '',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"load_type" text NOT NULL,
	"contact" text DEFAULT '',
	"phone" text DEFAULT '',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"username" text PRIMARY KEY,
	"password" text NOT NULL,
	"display_name" text NOT NULL,
	"role" text NOT NULL,
	"supplier" text,
	"load_perm" text DEFAULT 'ALL',
	"permissions" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
