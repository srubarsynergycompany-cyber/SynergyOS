# ADR-001 – Connector Strategy

Status: Accepted

## Decision

SynergyOS will use direct integrations with e-commerce platforms and carriers as the long-term architecture.

BaseLinker is supported only as a temporary migration bridge for customers already using it.

## Why

- Remove recurring middleware costs.
- Own the complete synchronization pipeline.
- Full control over integrations.
- Higher product value.
- Independence from third-party middleware.

## Target integrations

### E-commerce
- Shopify
- Shoptet
- WooCommerce
- PrestaShop
- Magento
- Upgates

### Carriers
- Zásilkovna
- PPL
- DPD
- GLS
- DHL
- FedEx

## Architecture principles

Every connector must implement a common connector interface.

No module in SynergyOS may depend directly on BaseLinker.

AI always reads data directly from SynergyOS services.

## Roadmap

1. Complete SynergyOS for internal fulfillment.
2. Build Synergy Connect.
3. Replace BaseLinker module by module.
4. Operate SynergyOS without BaseLinker.
5. Release SynergyOS as a SaaS platform.
