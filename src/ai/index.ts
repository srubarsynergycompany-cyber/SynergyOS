export type {
  AssistantId,
  AssistantRegistry,
  BusinessDomain,
  SpecialistAssistant,
} from "./agents";
export {
  createAssistantRegistry,
  DEFAULT_SPECIALIST_ASSISTANTS,
} from "./agents";

export type {
  InMemoryKnowledgeBaseOptions,
  KnowledgeBase,
  KnowledgeEntry,
  KnowledgeSource,
} from "./knowledgeBase";
export { createInMemoryKnowledgeBase } from "./knowledgeBase";

export type {
  AIWorkspaceState,
  CreateWorkspaceOptions,
  ProjectStatusOverview,
} from "./workspace";
export { createAIWorkspaceState } from "./workspace";

export type {
  AIDirector,
  AIProviderAdapter,
  ActionPlanItem,
  ApprovalFlag,
  DirectorRequest,
  DirectorResponse,
} from "./aiDirector";
export { createAIDirector } from "./aiDirector";
