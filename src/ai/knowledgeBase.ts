export interface KnowledgeSource {
  id: string;
  title: string;
  kind: "document" | "policy" | "roadmap" | "notes";
  path: string;
  approved: boolean;
}

export interface KnowledgeEntry {
  sourceId: string;
  summary: string;
  tags: string[];
}

export interface KnowledgeBase {
  listSources(): KnowledgeSource[];
  search(query: string): KnowledgeEntry[];
}

export interface InMemoryKnowledgeBaseOptions {
  sources?: ReadonlyArray<KnowledgeSource>;
  entries?: ReadonlyArray<KnowledgeEntry>;
}

export function createInMemoryKnowledgeBase(options: InMemoryKnowledgeBaseOptions = {}): KnowledgeBase {
  const sources = [...(options.sources ?? [])];
  const entries = [...(options.entries ?? [])];

  return {
    listSources() {
      return [...sources];
    },
    search(query) {
      const normalized = query.trim().toLowerCase();
      if (!normalized) {
        return [...entries];
      }

      return entries.filter((entry) => {
        const inSummary = entry.summary.toLowerCase().includes(normalized);
        const inTags = entry.tags.some((tag) => tag.toLowerCase().includes(normalized));
        return inSummary || inTags;
      });
    },
  };
}
