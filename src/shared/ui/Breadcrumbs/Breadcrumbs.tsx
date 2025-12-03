import type { FolderNode } from "@/entities/fs/model/types";

interface BreadcrumbsProps {
  path: FolderNode[];
  onNavigate: (id: string) => void;
}

export const Breadcrumbs = ({ path, onNavigate }: BreadcrumbsProps) => {
  if (!path.length) return null;

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-600">
      {path.map((item, index) => {
        const isLast = index === path.length - 1;

        return (
          <span key={item.id} className="flex items-center gap-1">
            {!isLast ? (
              <button
                type="button"
                className="rounded px-1 py-0.5 text-blue-600 hover:bg-blue-50"
                onClick={() => onNavigate(item.id)}
              >
                {item.name}
              </button>
            ) : (
              <span className="font-semibold">{item.name}</span>
            )}

            {!isLast && <span className="text-slate-400">/</span>}
          </span>
        );
      })}
    </nav>
  );
};
