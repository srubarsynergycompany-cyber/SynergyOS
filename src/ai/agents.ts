export type BusinessDomain =
  | "sales"
  | "marketing"
  | "operations"
  | "finance"
  | "development"
  | "general";

export type AssistantId =
  | "sales-ai"
  | "marketing-ai"
  | "operations-ai"
  | "finance-ai"
  | "development-ai"
  | "ai-director";

export interface SpecialistAssistant {
  id: AssistantId;
  name: string;
  domain: BusinessDomain;
  description: string;
  available: boolean;
}

export interface AssistantRegistry {
  getAll(): SpecialistAssistant[];
  findByDomain(domain: BusinessDomain): SpecialistAssistant | null;
}

export const DEFAULT_SPECIALIST_ASSISTANTS: ReadonlyArray<SpecialistAssistant> = [
  {
    id: "sales-ai",
    name: "Sales AI",
    domain: "sales",
    description: "Handles sales planning and pipeline support.",
    available: true,
  },
  {
    id: "marketing-ai",
    name: "Marketing AI",
    domain: "marketing",
    description: "Supports campaigns, messaging, and growth planning.",
    available: true,
  },
  {
    id: "operations-ai",
    name: "Operations AI",
    domain: "operations",
    description: "Supports fulfillment, warehouse, and process topics.",
    available: true,
  },
  {
    id: "finance-ai",
    name: "Finance AI",
    domain: "finance",
    description: "Supports financial analysis and planning topics.",
    available: true,
  },
  {
    id: "development-ai",
    name: "Development AI",
    domain: "development",
    description: "Supports product and engineering planning.",
    available: true,
  },
];

export function createAssistantRegistry(
  specialists: ReadonlyArray<SpecialistAssistant> = DEFAULT_SPECIALIST_ASSISTANTS,
): AssistantRegistry {
  return {
    getAll() {
      return [...specialists];
    },
    findByDomain(domain) {
      return specialists.find((assistant) => assistant.domain === domain && assistant.available) ?? null;
    },
  };
}
