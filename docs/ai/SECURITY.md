# Synergy AI Security

## Purpose
Security defines what AI assistants are allowed to access, draft and execute. The platform must be safe for internal use and future external SaaS customers.

## Core Security Principles

1. Least privilege by default.
2. Human approval for sensitive actions.
3. Full auditability of AI actions.
4. Tenant data isolation for future SaaS customers.
5. No autonomous destructive actions.
6. No silent external communication.

## Permission Levels

### Level 0 – No Access
Assistant cannot access the resource.

### Level 1 – Read Only
Assistant can read and analyze data but cannot modify anything.

### Level 2 – Draft Only
Assistant can prepare drafts, recommendations or proposed changes.

### Level 3 – Approval Required
Assistant can prepare an action but execution requires human approval.

### Level 4 – Autonomous Low Risk
Assistant can execute pre-approved low-risk actions.

### Level 5 – Forbidden
Action is always forbidden, regardless of context.

## Sensitive Actions
The following actions require approval:
- sending emails,
- publishing website changes,
- deploying to production,
- changing prices,
- changing client settings,
- modifying database records,
- deleting data,
- issuing refunds,
- making legal or tax commitments,
- changing ad budgets.

## Audit Log Requirements
Every AI action should eventually log:
- timestamp,
- user,
- assistant,
- requested task,
- data sources used,
- recommendation,
- proposed action,
- approval status,
- executed result.

## Data Isolation
For future SaaS use, every tenant must have:
- isolated knowledge base,
- isolated operational data,
- isolated audit logs,
- separate permissions,
- separate billing and configuration.

## External Communication Rule
AI may draft external communication, but must not send it without explicit approval unless a specific low-risk automation has been approved in advance.

## Development Rule
AI may create code, documentation and pull requests. Production deployment and destructive migrations require explicit approval.

## Initial MVP Security
The first MVP should be limited to:
- read-only knowledge access,
- draft-only outputs,
- no autonomous actions,
- no production data modification,
- manual approval for all external communication.
