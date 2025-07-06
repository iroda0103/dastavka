CREATE TYPE "public"."order_status" AS ENUM('new', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'card', 'online');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."restaurant_category" AS ENUM('fast_food', 'milliy_taom', 'pizza', 'burger');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('client', 'driver', 'admin', 'restaurant', 'chef');--> statement-breakpoint
CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_name" text NOT NULL,
	"filename" text NOT NULL,
	"mimetype" text NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"url" text NOT NULL,
	"uploaded_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "files_filename_unique" UNIQUE("filename")
);
--> statement-breakpoint
CREATE TABLE "menu" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"restaurant_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"menu_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"status" "order_status" DEFAULT 'new' NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"subtotal_price" numeric(10, 2) NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"discount" integer DEFAULT 0,
	"delivery_fee" numeric(10, 2) DEFAULT '0',
	"payment_method" "payment_method" DEFAULT 'cash' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"estimated_delivery_time" timestamp,
	"delivered_at" timestamp,
	"restaurant_rating" integer,
	"delivery_rating" integer,
	"driver_id" integer,
	"client_id" integer NOT NULL,
	"restaurant_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"password" varchar(255),
	"image" text NOT NULL,
	"address" text,
	"category" "restaurant_category" NOT NULL,
	"city_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "restaurants_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"phone" varchar(20) NOT NULL,
	"password" varchar(255),
	"address" text,
	"role" "user_role" NOT NULL,
	"telegram_id" varchar(50),
	"city_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
ALTER TABLE "menu" ADD CONSTRAINT "menu_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_menu_id_menu_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menu"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_driver_id_users_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE set null ON UPDATE no action;