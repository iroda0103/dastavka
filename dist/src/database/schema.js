"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.files = exports.orderItemsRelations = exports.orderItems = exports.ordersRelations = exports.orders = exports.menuRelations = exports.menu = exports.restaurantsRelations = exports.restaurants = exports.usersRelations = exports.users = exports.citiesRelations = exports.cities = exports.paymentStatusEnum = exports.paymentMethodEnum = exports.orderStatusEnum = exports.restaurantCategoryEnum = exports.userRoleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', [
    'client',
    'driver',
    'admin',
    'restaurant',
    'chef',
]);
exports.restaurantCategoryEnum = (0, pg_core_1.pgEnum)('restaurant_category', [
    'fast_food',
    'milliy_taom',
    'pizza',
    'burger',
]);
exports.orderStatusEnum = (0, pg_core_1.pgEnum)('order_status', [
    'new',
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
    'cancelled',
]);
exports.paymentMethodEnum = (0, pg_core_1.pgEnum)('payment_method', [
    'cash',
    'card',
    'online',
]);
exports.paymentStatusEnum = (0, pg_core_1.pgEnum)('payment_status', [
    'pending',
    'paid',
    'failed',
    'refunded',
]);
exports.cities = (0, pg_core_1.pgTable)('cities', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.citiesRelations = (0, drizzle_orm_1.relations)(exports.cities, ({ many }) => ({
    restaurants: many(exports.restaurants),
    users: many(exports.users),
}));
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name'),
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }).unique().notNull(),
    password: (0, pg_core_1.varchar)('password', { length: 255 }),
    address: (0, pg_core_1.text)('address'),
    role: (0, exports.userRoleEnum)('role').notNull(),
    telegramId: (0, pg_core_1.varchar)('telegram_id', { length: 50 }).unique(),
    cityId: (0, pg_core_1.integer)('city_id').references(() => exports.cities.id, {
        onDelete: 'set null',
    }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many, one }) => ({
    driverOrders: many(exports.orders, { relationName: 'driver' }),
    clientOrders: many(exports.orders, { relationName: 'client' }),
    city: one(exports.cities, {
        fields: [exports.users.cityId],
        references: [exports.cities.id],
    }),
}));
exports.restaurants = (0, pg_core_1.pgTable)('restaurants', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    phone: (0, pg_core_1.varchar)('phone', { length: 20 }).unique().notNull(),
    password: (0, pg_core_1.varchar)('password', { length: 255 }),
    image: (0, pg_core_1.text)('image').notNull(),
    address: (0, pg_core_1.text)('address'),
    category: (0, exports.restaurantCategoryEnum)('category').notNull(),
    cityId: (0, pg_core_1.integer)('city_id')
        .notNull()
        .references(() => exports.cities.id, { onDelete: 'restrict' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.restaurantsRelations = (0, drizzle_orm_1.relations)(exports.restaurants, ({ many, one }) => ({
    orders: many(exports.orders),
    menu: many(exports.menu),
    city: one(exports.cities, {
        fields: [exports.restaurants.cityId],
        references: [exports.cities.id],
    }),
}));
exports.menu = (0, pg_core_1.pgTable)('menu', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    image: (0, pg_core_1.text)('image').notNull(),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 }).notNull(),
    restaurantId: (0, pg_core_1.integer)('restaurant_id')
        .notNull()
        .references(() => exports.restaurants.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.menuRelations = (0, drizzle_orm_1.relations)(exports.menu, ({ many, one }) => ({
    restaurant: one(exports.restaurants, {
        fields: [exports.menu.restaurantId],
        references: [exports.restaurants.id],
    }),
    orderItems: many(exports.orderItems),
}));
exports.orders = (0, pg_core_1.pgTable)('orders', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    address: (0, pg_core_1.text)('address').notNull(),
    status: (0, exports.orderStatusEnum)('status').notNull().default('new'),
    totalPrice: (0, pg_core_1.decimal)('total_amount', { precision: 10, scale: 2 }).notNull(),
    subtotalPrice: (0, pg_core_1.decimal)('subtotal_price', {
        precision: 10,
        scale: 2,
    }).notNull(),
    isDeleted: (0, pg_core_1.boolean)('is_deleted').default(false),
    discount: (0, pg_core_1.integer)('discount').default(0),
    deliveryFee: (0, pg_core_1.decimal)('delivery_fee', { precision: 10, scale: 2 }).default('0'),
    paymentMethod: (0, exports.paymentMethodEnum)('payment_method').notNull().default('cash'),
    paymentStatus: (0, exports.paymentStatusEnum)('payment_status')
        .notNull()
        .default('pending'),
    estimatedDeliveryTime: (0, pg_core_1.timestamp)('estimated_delivery_time'),
    deliveredAt: (0, pg_core_1.timestamp)('delivered_at'),
    restaurantRating: (0, pg_core_1.integer)('restaurant_rating'),
    deliveryRating: (0, pg_core_1.integer)('delivery_rating'),
    driverId: (0, pg_core_1.integer)('driver_id').references(() => exports.users.id, {
        onDelete: 'set null',
    }),
    clientId: (0, pg_core_1.integer)('client_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    restaurantId: (0, pg_core_1.integer)('restaurant_id')
        .notNull()
        .references(() => exports.restaurants.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.ordersRelations = (0, drizzle_orm_1.relations)(exports.orders, ({ one, many }) => ({
    driver: one(exports.users, {
        fields: [exports.orders.driverId],
        references: [exports.users.id],
        relationName: 'driver',
    }),
    client: one(exports.users, {
        fields: [exports.orders.clientId],
        references: [exports.users.id],
        relationName: 'client',
    }),
    restaurant: one(exports.restaurants, {
        fields: [exports.orders.restaurantId],
        references: [exports.restaurants.id],
    }),
    orderItems: many(exports.orderItems),
}));
exports.orderItems = (0, pg_core_1.pgTable)('order_items', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    orderId: (0, pg_core_1.integer)('order_id')
        .notNull()
        .references(() => exports.orders.id, { onDelete: 'cascade' }),
    menuId: (0, pg_core_1.integer)('menu_id')
        .notNull()
        .references(() => exports.menu.id, { onDelete: 'restrict' }),
    quantity: (0, pg_core_1.integer)('quantity').notNull(),
    price: (0, pg_core_1.decimal)('price', { precision: 10, scale: 2 }).notNull(),
    notes: (0, pg_core_1.text)('notes'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.orderItemsRelations = (0, drizzle_orm_1.relations)(exports.orderItems, ({ one }) => ({
    order: one(exports.orders, {
        fields: [exports.orderItems.orderId],
        references: [exports.orders.id],
    }),
    menuItem: one(exports.menu, {
        fields: [exports.orderItems.menuId],
        references: [exports.menu.id],
    }),
}));
exports.files = (0, pg_core_1.pgTable)('files', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    originalName: (0, pg_core_1.text)('original_name').notNull(),
    filename: (0, pg_core_1.text)('filename').notNull().unique(),
    mimetype: (0, pg_core_1.text)('mimetype').notNull(),
    size: (0, pg_core_1.integer)('size').notNull(),
    path: (0, pg_core_1.text)('path').notNull(),
    url: (0, pg_core_1.text)('url').notNull(),
    uploadedBy: (0, pg_core_1.integer)('uploaded_by').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.schema = {
    cities: exports.cities,
    citiesRelations: exports.citiesRelations,
    users: exports.users,
    usersRelations: exports.usersRelations,
    restaurants: exports.restaurants,
    restaurantsRelations: exports.restaurantsRelations,
    orders: exports.orders,
    ordersRelations: exports.ordersRelations,
    menu: exports.menu,
    menuRelations: exports.menuRelations,
    orderItems: exports.orderItems,
    orderItemsRelations: exports.orderItemsRelations,
    userRoleEnum: exports.userRoleEnum,
    restaurantCategoryEnum: exports.restaurantCategoryEnum,
    orderStatusEnum: exports.orderStatusEnum,
    paymentMethodEnum: exports.paymentMethodEnum,
    paymentStatusEnum: exports.paymentStatusEnum,
};
//# sourceMappingURL=schema.js.map