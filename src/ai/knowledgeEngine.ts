export type KnowledgeDomain =
  | "orders"
  | "products"
  | "warehouse"
  | "clients"
  | "finance"
  | "docs";

export interface KnowledgeSourceRecord {
  id: string;
  title: string;
  domain: KnowledgeDomain;
  path: string;
  description?: string;
  tags: string[];
  priority: 1 | 2 | 3 | 4 | 5;
  approved: boolean;
}

export interface RegisterKnowledgeSourcesResult {
  readOnly: true;
  totalSources: number;
  addedSourceIds: string[];
}

export interface KnowledgeSearchResult {
  readOnly: true;
  domain: KnowledgeDomain;
  sources: KnowledgeSourceRecord[];
}

export interface SafeAnswerContext {
  readOnly: true;
  domain: KnowledgeDomain;
  question: string;
  sourceCount: number;
  sourcePaths: string[];
  guidance: string[];
  assumptions: string[];
}

export interface KnowledgeEngine {
  listDomains(): KnowledgeDomain[];
  registerKnowledgeSources(sources: ReadonlyArray<KnowledgeSourceRecord>): RegisterKnowledgeSourcesResult;
  searchSourcesByDomain(domain: KnowledgeDomain): KnowledgeSearchResult;
  buildSafeAnswerContext(input: { domain: KnowledgeDomain; question: string }): SafeAnswerContext;
}

const SUPPORTED_DOMAINS: ReadonlyArray<KnowledgeDomain> = [
  "orders",
  "products",
  "warehouse",
  "clients",
  "finance",
  "docs",
];

function normalizeTags(tags: ReadonlyArray<string>): string[] {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

export function createKnowledgeEngine(initialSources: ReadonlyArray<KnowledgeSourceRecord> = []): KnowledgeEngine {
  const sources = new Map<string, KnowledgeSourceRecord>();

  for (const source of initialSources) {
    sources.set(source.id, { ...source, tags: normalizeTags(source.tags) });
  }

  return {
    listDomains() {
      return [...SUPPORTED_DOMAINS];
    },

    registerKnowledgeSources(nextSources) {
      const addedSourceIds: string[] = [];

      for (const source of nextSources) {
        if (!SUPPORTED_DOMAINS.includes(source.domain)) {
          continue;
        }

        const normalized: KnowledgeSourceRecord = {
          ...source,
          tags: normalizeTags(source.tags),
        };

        sources.set(source.id, normalized);
        addedSourceIds.push(source.id);
      }

      return {
        readOnly: true,
        totalSources: sources.size,
        addedSourceIds,
      };
    },

    searchSourcesByDomain(domain) {
      const domainSources = Array.from(sources.values())
        .filter((source) => source.domain === domain)
        .sort((left, right) => left.priority - right.priority || left.title.localeCompare(right.title));

      return {
        readOnly: true,
        domain,
        sources: domainSources,
      };
    },

    buildSafeAnswerContext(input) {
      const domainResult = this.searchSourcesByDomain(input.domain);
      const approvedSources = domainResult.sources.filter((source) => source.approved);

      return {
        readOnly: true,
        domain: input.domain,
        question: input.question,
        sourceCount: approvedSources.length,
        sourcePaths: approvedSources.map((source) => source.path),
        guidance: [
          "Use repository and approved internal documentation first.",
          "Mark assumptions explicitly when source evidence is missing.",
          "Escalate if sources conflict or are outdated.",
          "Keep recommendations advisory only and avoid autonomous actions.",
        ],
        assumptions: approvedSources.length === 0
          ? ["No approved sources found for this domain; response should be limited and request confirmation."]
          : [],
      };
    },
  };
}

export { SUPPORTED_DOMAINS };
