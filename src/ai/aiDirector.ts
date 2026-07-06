import type { AssistantRegistry, BusinessDomain, SpecialistAssistant } from "./agents";
import type { KnowledgeBase, KnowledgeEntry } from "./knowledgeBase";

export interface DirectorRequest {
  prompt: string;
  context?: {
    priority?: "low" | "medium" | "high";
    project?: string;
  };
}

export interface ApprovalFlag {
  reason: string;
  approvalRequired: boolean;
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  approval: ApprovalFlag;
}

export interface DirectorResponse {
  domain: BusinessDomain;
  selectedAssistant: SpecialistAssistant | null;
  plan: ActionPlanItem[];
  knowledge: KnowledgeEntry[];
  nextRecommendedStep: string;
  safeDraftOnly: true;
}

export interface AIProviderAdapter {
  name: string;
  execute?(request: DirectorRequest): Promise<unknown>;
}

export interface AIDirector {
  handle(request: DirectorRequest): DirectorResponse;
}

const DOMAIN_KEYWORDS: Record<Exclude<BusinessDomain, "general">, string[]> = {
  sales: ["sales", "lead", "pipeline", "revenue", "customer"],
  marketing: ["marketing", "campaign", "content", "seo", "brand"],
  operations: ["fulfillment", "warehouse", "inventory", "shipping", "logistics"],
  finance: ["finance", "budget", "cashflow", "pnl", "pricing"],
  development: ["dev", "development", "engineering", "feature", "release"],
};

const APPROVAL_KEYWORDS = [
  "deploy",
  "delete",
  "pricing",
  "budget",
  "advertising",
  "payment",
  "send",
  "external",
  "production",
];

function classifyDomain(input: string): BusinessDomain {
  const normalized = input.toLowerCase();

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS) as [Exclude<BusinessDomain, "general">, string[]][]) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return domain;
    }
  }

  return "general";
}

function needsApproval(input: string): boolean {
  const normalized = input.toLowerCase();
  return APPROVAL_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function createAIDirector(registry: AssistantRegistry, knowledgeBase: KnowledgeBase): AIDirector {
  return {
    handle(request) {
      const domain = classifyDomain(request.prompt);
      const selectedAssistant = registry.findByDomain(domain);
      const approvalRequired = needsApproval(request.prompt);
      const knowledge = knowledgeBase.search(request.prompt).slice(0, 5);

      const plan: ActionPlanItem[] = [
        {
          id: "1",
          title: "Clarify objective",
          description: "Restate the user goal and confirm success criteria.",
          approval: {
            reason: "Planning and clarification are safe draft actions.",
            approvalRequired: false,
          },
        },
        {
          id: "2",
          title: "Prepare delegated work package",
          description: selectedAssistant
            ? `Draft a structured task package for ${selectedAssistant.name}.`
            : "Draft a general task package for manual assignment.",
          approval: {
            reason: approvalRequired
              ? "Request contains potentially sensitive action keywords."
              : "Delegation package is a non-executing draft.",
            approvalRequired,
          },
        },
        {
          id: "3",
          title: "Return safe recommendation",
          description: "Provide next steps and explicitly mark any approval boundaries.",
          approval: {
            reason: "Output remains advisory and does not trigger autonomous actions.",
            approvalRequired: false,
          },
        },
      ];

      return {
        domain,
        selectedAssistant,
        plan,
        knowledge,
        nextRecommendedStep: approvalRequired
          ? "Ask for explicit approval before any sensitive action is executed."
          : "Review the draft action plan and approve delegation.",
        safeDraftOnly: true,
      };
    },
  };
}
