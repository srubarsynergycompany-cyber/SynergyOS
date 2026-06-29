"use client";

type SidebarProps = {
  active: string;
  setActive: (section: string) => void;
  sections?: string[];
  brand?: string;
  subtitle?: string;
};

const defaultSections = [
  "Dashboard",
  "Objednávky",
  "Sklad",
  "CRM",
  "Doprava",
  "Finance",
  "AI Command Center",
];

export default function Sidebar({
  active,
  setActive,
  sections = defaultSections,
  brand = "SynergyOS",
  subtitle = "AI Fulfillment Platform",
}: SidebarProps) {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 p-6">
      <h1 className="text-2xl font-bold">{brand}</h1>
      <p className="mt-2 text-sm text-slate-400">{subtitle}</p>

      <nav className="mt-10 space-y-3 text-sm">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActive(section)}
            className={`w-full rounded-lg px-4 py-3 text-left ${
              active === section
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {section}
          </button>
        ))}
      </nav>
    </aside>
  );
}