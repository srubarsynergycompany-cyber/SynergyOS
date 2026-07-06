import type { AssistantRegistry, SpecialistAssistant } from "./agents";
import type { KnowledgeBase, KnowledgeSource } from "./knowledgeBase";

export interface ProjectStatusOverview {
  activeProjectCount: number;
  topPriorities: string[];
  blockers: string[];
}

export interface AIWorkspaceState {
  title: string;
  mainAssistantName: string;
  assistants: SpecialistAssistant[];
  knowledgeSources: KnowledgeSource[];
  projectStatus: ProjectStatusOverview;
  nextSteps: string[];
}

export interface CreateWorkspaceOptions {
  title?: string;
  mainAssistantName?: string;
  projectStatus?: ProjectStatusOverview;
  nextSteps?: string[];
}

const DEFAULT_STATUS: ProjectStatusOverview = {
  activeProjectCount: 0,
  topPriorities: [],
  blockers: [],
};

export function createAIWorkspaceState(
  registry: AssistantRegistry,
  knowledgeBase: KnowledgeBase,
  options: CreateWorkspaceOptions = {},
): AIWorkspaceState {
  return {
    title: options.title ?? "Synergy AI Workspace",
    mainAssistantName: options.mainAssistantName ?? "AI Director",
    assistants: registry.getAll(),
    knowledgeSources: knowledgeBase.listSources(),
    projectStatus: options.projectStatus ?? DEFAULT_STATUS,
    nextSteps: options.nextSteps ?? [],
  };
}
