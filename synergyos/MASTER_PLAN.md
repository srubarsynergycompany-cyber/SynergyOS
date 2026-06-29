# SynergyOS Master Plan

Version: 0.1

---

# Vision

SynergyOS is a professional cloud-based Warehouse Management System (WMS) and Fulfillment Platform developed by Synergy.

The primary goal is to operate Synergy's own fulfillment center.

The secondary goal is to commercialize the platform worldwide as a SaaS product for fulfillment companies, warehouses and e-commerce businesses.

Every decision during development must support scalability, reliability, modularity and international expansion.

Synergy will always be the first production customer.

---

# EPIC: Foundation Architecture

Status: Completed (2026-06-29)

## 1) Global App Shell

- Unified `AppShell` in root layout for all app routes.
- Responsive sidebar navigation for all core modules.
- Top navigation chips in the header for fast module switching.
- Global notifications entry and user profile block.
- Breadcrumbs generated from route segments with shared hook.

## 2) Global Design System

Implemented shared UI primitives:

- Buttons (`components/ui/Button.tsx`)
- Inputs (`components/ui/Input.tsx`)
- Tables (`components/ui/Table.tsx`)
- Cards (`components/ui/Card.tsx`)
- Status badges (`components/ui/StatusBadge.tsx`)
- Dialogs (`components/ui/Dialog.tsx`)
- Forms (`components/ui/Form.tsx`)
- Loading states (`components/ui/LoadingState.tsx`)
- Empty states (`components/ui/EmptyState.tsx`)

## 3) Navigation Coverage

Global navigation includes:

- Dashboard
- Orders
- Inventory
- Warehouse
- Packing
- Shipping
- Returns
- Customers
- Products
- Reports
- Settings

All navigation targets now have route pages under `app/` and inherit the same global layout.

## 4) Global Types

Shared TypeScript interfaces in `types/index.ts`:

- `Order`
- `Customer`
- `Product`
- `WarehouseLocation`
- `Shipment`
- `User`
- `InventoryItem`

## 5) Core Folders

Project-level architecture folders are in place:

- `services/`
- `hooks/`
- `types/`
- `utils/`

## 6) Mock API Layer (Swappable)

Service architecture now separates provider/data concerns from feature usage:

- `services/provider.ts` defines provider contract and mock provider factory.
- `services/mockData.ts` stores mock records separately.
- `services/index.ts` exposes domain services (`orderService`, `inventoryService`, etc.).
- `services/mockApi.ts` remains as a backward-compatible facade.

This structure allows future PostgreSQL integration by replacing provider implementation while keeping page/component usage stable.