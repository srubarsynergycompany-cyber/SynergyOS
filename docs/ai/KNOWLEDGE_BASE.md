# Synergy AI Knowledge Base

## Purpose
The knowledge base is the source of truth for Synergy AI. Assistants must use documented knowledge before making assumptions.

## Knowledge Categories

### 1. Company Knowledge
- company description,
- services,
- pricing,
- target customers,
- positioning,
- sales arguments,
- internal priorities.

### 2. Product Knowledge
- SynergyOS functionality,
- Synergy AI modules,
- customer-facing features,
- implementation status,
- known limitations.

### 3. Operational Knowledge
- fulfillment processes,
- warehouse workflows,
- returns,
- claims,
- shipping rules,
- carrier integrations,
- client onboarding.

### 4. Marketing Knowledge
- website copy,
- SEO pages,
- ad campaigns,
- social media assets,
- competitor analysis,
- customer personas.

### 5. Sales Knowledge
- lead criteria,
- outreach templates,
- offer templates,
- objections,
- follow-up logic,
- CRM notes.

### 6. Financial Knowledge
- price lists,
- margin rules,
- cost assumptions,
- cash-flow plans,
- reporting templates.

### 7. Technical Knowledge
- architecture decisions,
- codebase structure,
- APIs,
- database models,
- deployment rules,
- development standards.

## Knowledge Source Priority
Assistants must use this order:
1. Current repository documentation.
2. Approved internal company documents.
3. Current system data.
4. User-confirmed decisions.
5. External research only when needed.

## Knowledge Quality Rules
- Outdated information must be marked as outdated.
- Assumptions must be clearly labeled.
- Conflicting sources must be escalated.
- Critical business decisions require confirmation.

## Future Implementation
The knowledge base should eventually support:
- document ingestion,
- semantic search,
- source citation,
- tenant separation,
- update history,
- approval workflow for new knowledge.

## Initial MVP
For the first MVP, the knowledge base can start as repository-based Markdown documentation under `docs/ai` and selected SynergyOS project documents.
