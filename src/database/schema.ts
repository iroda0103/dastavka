import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum definitions
export const userRoleEnum = pgEnum('user_role', [
  'client',
  'driver',
  'admin',
  'restaurant',
  'chef',
]);

export const restaurantCategoryEnum = pgEnum('restaurant_category', [
  'fast_food',
  'milliy_taom',
  'pizza',
  'burger',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'new',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'delivered',
  'cancelled',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'card',
  'online',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'refunded',
]);

// Cities table
export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const citiesRelations = relations(cities, ({ many }) => ({
  restaurants: many(restaurants),
  users: many(users),
}));

// Users table (includes drivers and clients)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  phone: varchar('phone', { length: 20 }).unique().notNull(),
  password: varchar('password', { length: 255 }),
  address: text('address'),
  role: userRoleEnum('role').notNull(),
  telegramId: varchar('telegram_id', { length: 50 }).unique(),
  cityId: integer('city_id').references(() => cities.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  driverOrders: many(orders, { relationName: 'driver' }),
  clientOrders: many(orders, { relationName: 'client' }),
  city: one(cities, {
    fields: [users.cityId],
    references: [cities.id],
  }),
}));

// Restaurants table with category and city relation
export const restaurants = pgTable('restaurants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: varchar('phone', { length: 20 }).unique().notNull(),
  password: varchar('password', { length: 255 }),
  image: text('image').notNull(),
  address: text('address'),
  category: restaurantCategoryEnum('category').notNull(),
  cityId: integer('city_id')
    .notNull()
    .references(() => cities.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const restaurantsRelations = relations(restaurants, ({ many, one }) => ({
  orders: many(orders),
  menu: many(menu),
  city: one(cities, {
    fields: [restaurants.cityId],
    references: [cities.id],
  }),
}));

// Menu table (restaurant menu items)
export const menu = pgTable('menu', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  restaurantId: integer('restaurant_id')
    .notNull()
    .references(() => restaurants.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const menuRelations = relations(menu, ({ many, one }) => ({
  restaurant: one(restaurants, {
    fields: [menu.restaurantId],
    references: [restaurants.id],
  }),
  orderItems: many(orderItems),
}));

// Orders table with enhanced delivery features
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  address: text('address').notNull(),
  status: orderStatusEnum('status').notNull().default('new'),
  totalPrice: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  subtotalPrice: decimal('subtotal_price', {
    precision: 10,
    scale: 2,
  }).notNull(),
  isDeleted: boolean('is_deleted').default(false),
  discount: integer('discount').default(0),
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).default(
    '0',
  ),
  // Payment fields
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('cash'),
  paymentStatus: paymentStatusEnum('payment_status')
    .notNull()
    .default('pending'),
  // Delivery timing
  estimatedDeliveryTime: timestamp('estimated_delivery_time'),
  deliveredAt: timestamp('delivered_at'),
  // Ratings
  restaurantRating: integer('restaurant_rating'), // 1-5 stars
  deliveryRating: integer('delivery_rating'), // 1-5 stars
  // Foreign keys
  driverId: integer('driver_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  clientId: integer('client_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  restaurantId: integer('restaurant_id')
    .notNull()
    .references(() => restaurants.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  driver: one(users, {
    fields: [orders.driverId],
    references: [users.id],
    relationName: 'driver',
  }),
  client: one(users, {
    fields: [orders.clientId],
    references: [users.id],
    relationName: 'client',
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  orderItems: many(orderItems),
}));

// Order items table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  menuId: integer('menu_id')
    .notNull()
    .references(() => menu.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menu, {
    fields: [orderItems.menuId],
    references: [menu.id],
  }),
}));

export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  originalName: text('original_name').notNull(),
  filename: text('filename').notNull().unique(),
  mimetype: text('mimetype').notNull(),
  size: integer('size').notNull(),
  path: text('path').notNull(),
  url: text('url').notNull(),
  uploadedBy: integer('uploaded_by').notNull(), // Foreign key to users table
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

export const schema = {
  cities,
  citiesRelations,
  users,
  usersRelations,
  restaurants,
  restaurantsRelations,
  orders,
  ordersRelations,
  menu,
  menuRelations,
  orderItems,
  orderItemsRelations,
  // Enums
  userRoleEnum,
  restaurantCategoryEnum,
  orderStatusEnum,
  paymentMethodEnum,
  paymentStatusEnum,
};
