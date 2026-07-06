# Synergy AI Architecture

## Architectural Goal
Synergy AI must be designed as a reusable AI platform that can serve SynergyOS and also become a standalone SaaS product for other companies.

## Platform Layers

### 1. Product Layer
User-facing products built on top of the AI platform.

Examples:
- SynergyOS for fulfillment,
- Synergy AI for internal company management,
- future client-specific AI workspaces.

### 2. Assistant Layer
A catalog of AI assistants with clearly defined roles, permissions and knowledge boundaries.

Examples:
- AI Director,
- Sales AI,
- Marketing AI,
- Operations AI,
- Finance AI,
- Development AI,
- Customer Support AI.

### 3. Orchestration Layer
Responsible for deciding which assistant should handle which task, how tasks are split and how results are combined.

Core responsibilities:
- task routing,
- assistant coordination,
- approval workflow,
- escalation to human owner,
- context passing between assistants.

### 4. Knowledge Layer
Stores and retrieves company and client knowledge.

Knowledge sources:
- company documents,
- pricing rules,
- processes,
- contracts,
- website copy,
- FAQs,
- historical decisions,
- SynergyOS operational data.

### 5. Permission Layer
Controls what each assistant can read, draft, recommend or execute.

Permission levels:
- read-only,
- draft-only,
- approval-required,
- autonomous low-risk,
- forbidden.

### 6. Integration Layer
Connects the platform to external systems.

Initial integrations:
- GitHub,
- Gmail,
- Google Drive,
- Google Calendar,
- e-shop platforms,
- carrier systems,
- CRM,
- accounting.

### 7. Audit Layer
Every action and decision must be traceable.

The audit log should record:
- who requested the action,
- which assistant handled it,
- what data was used,
- what was recommended,
- what was executed,
- whether human approval was required.

## Core Design Rules

1. AI must never be a black box for critical business actions.
2. Every assistant has a defined role and scope.
3. Sensitive actions require approval.
4. Commercial product architecture must support multiple companies.
5. Fulfillment-specific logic must not be hardcoded into the generic AI platform.
6. Documentation must stay ahead of implementation.

## Multi-Tenant Future
The platform should eventually support multiple independent client accounts.

Each tenant needs:
- isolated data,
- separate knowledge base,
- separate permissions,
- separate assistant configurations,
- separate billing,
- separate audit logs.

## First Technical Direction
Start with documentation and internal assistant specifications. Only then implement the first AI service/module inside SynergyOS.

The first technical implementation should be small:
- one AI workspace page,
- one AI Director assistant,
- read-only internal knowledge,
- no autonomous external actions.
