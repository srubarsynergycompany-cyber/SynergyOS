# SynergyOS Architecture

## 1. Product architecture

SynergyOS is envisioned as a multi-tenant SaaS platform for modern fulfillment operations. The product is designed to serve multiple fulfillment companies from a shared platform while keeping each tenant isolated in terms of data, workflows, and configuration.

Synergy serves as the first production tenant, providing the initial operating model and product direction. The architecture is intentionally prepared for future licensing to other fulfillment companies that want to run their own warehouse, shipping, and order management workflows on the same platform.

### Product direction
- Shared platform foundation for all tenants
- Tenant-aware data and configuration model
- Reusable workflows for warehouse, order, shipping, and billing operations
- Scalable path from MVP to enterprise-grade fulfillment software

## 2. Core modules

SynergyOS is organized around the following modules:

- Core
  - Tenant management
  - Authentication and authorization
  - Shared settings and platform configuration

- WMS (Warehouse Management System)
  - Receiving
  - Picking
  - Packing
  - Slot management
  - Worker task assignment

- OMS (Order Management System)
  - Order intake
  - Order lifecycle management
  - Fulfillment workflow states
  - Customer communication

- Shipping
  - Carrier integration
  - Label generation
  - Tracking visibility
  - Delivery status updates

- CRM
  - Customer records
  - Order history
  - Support and issue tracking

- Billing
  - Invoicing
  - Subscription and tenant billing
  - Pricing and service plans

- AI
  - Operational insights
  - Forecasting
  - Process automation assistance
  - Exception detection

## 3. Current implemented state

The current implementation already establishes the foundation for the fulfillment product:

- Dashboard
- Orders list
- Order detail
- Czech and English localization
- Order state machine
- Reusable order detail components

This state reflects a working UI foundation for fulfillment operations and a clear path toward deeper backend and workflow complexity.

## 4. Technical stack

The project is currently structured around a modern web application stack:

- Next.js for the application framework and routing
- TypeScript for type safety and maintainability
- PostgreSQL planned as the primary relational database
- Docker planned for containerized deployment and portability
- VPS deployment planned for production hosting
- GitHub used as the source control and collaboration platform

## 5. Data model draft

The following entities form the initial domain model for the platform:

### Organization
Represents a fulfillment company or tenant. Owns users, customers, orders, warehouses, and billing configuration.

### User
Represents an authenticated user in the system. Belongs to an organization and can have one or more roles.

### Role
Defines permissions and access scope within the organization, such as admin, warehouse operator, shipping manager, or finance user.

### Customer
Represents a business or end customer associated with one or more orders.

### Order
Represents a customer order in the fulfillment lifecycle. Tracks current status, customer, shipping destination, fulfillment progress, and associated items.

### OrderItem
Represents a single line item within an order. Includes product reference, quantity, location, and fulfillment state.

### Product
Represents a SKU or product catalog entry. Includes inventory, packaging, and pricing information.

### Warehouse
Represents a physical warehouse or fulfillment location controlled by an organization.

### WarehouseLocation
Represents a storage bin, zone, rack, shelf, or pick location inside a warehouse.

### Shipment
Represents the shipping execution for an order or part of an order. Tracks carrier, tracking number, shipment status, and delivery information.

### Carrier
Represents a shipping provider or logistics partner used by the platform.

### AuditLog
Tracks system events such as status changes, assignment updates, note changes, and other operational actions for traceability and compliance.

### License
Represents the commercial licensing model for a tenant, including plan type, validity period, and provisioning details.

## 6. Development rules

The following rules guide implementation and delivery:

- One module at a time
- No unrelated changes
- Build after every meaningful change
- Git commit after each stable milestone
- Keep Czech and English localization
- Prefer reusable components
- Cursor writes code; architecture is controlled by the project owner and AI architect

## 7. Near-term roadmap

The next milestones for the platform are:

- Finish Order Detail workflow
- Audit log
- Warehouse worker assignment
- Product scan confirmation
- Inventory module
- PostgreSQL migration

## Summary

SynergyOS is currently evolving from a polished fulfillment UI into a modular, tenant-ready operations platform. The architecture is being shaped to support both the immediate Synergy use case and the future expansion to other fulfillment companies through a scalable SaaS foundation.
