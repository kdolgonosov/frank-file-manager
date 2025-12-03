import { useState, type KeyboardEvent } from "react";

import type { FsNode } from "@/entities/fs/model/types";
import {
  detectFileKind,
  getFileTypeIcon,
  getFileTypeLabel,
} from "@/shared/lib/fileKind";

interface FileGridProps {
  items: FsNode[];
  onOpenFolder: (id: string) => void;
  onDownloadFile: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  getNodeSize: (node: FsNode) => number;
}

export const FileGrid = ({
  items,
  onOpenFolder,
  onDownloadFile,
  onRename,
  onDelete,
  getNodeSize,
}: FileGridProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const startEditing = (item: FsNode) => {
    setEditingId(item.id);
    setDraftName(item.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftName("");
  };

  const commitEditing = (item: FsNode) => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== item.name) {
      onRename(item.id, trimmed);
    }
    cancelEditing();
  };

  const handleNameKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    item: FsNode
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitEditing(item);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  if (!items.length) {
    return (
      <div className="mt-3 rounded-xl bg-slate-200 px-4 py-3 text-sm text-slate-700">
        Пусто. Создайте папку или загрузите файл.
      </div>
    );
  }

  return (
    <div className="mt-3 grid gap-2 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
      {items.map((item) => {
        const kind = detectFileKind(item);
        const icon = getFileTypeIcon(kind);
        const typeLabel = getFileTypeLabel(kind);
        const isEditing = editingId === item.id;
        const size = getNodeSize(item);

        const handleOpen = () => {
          if (isEditing) return;
          if (item.type === "folder") onOpenFolder(item.id);
          else onDownloadFile(item.id);
        };

        return (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-xl bg-white p-2 shadow-sm touch-manipulation"
            onDoubleClick={handleOpen}
          >
            {isEditing ? (
              <div className="flex flex-1 items-center gap-2 rounded-lg px-1 py-1">
                <div className="text-2xl" aria-hidden="true">
                  {icon}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <input
                    className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none ring-blue-500 focus:ring-1"
                    autoFocus
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    onBlur={() => commitEditing(item)}
                    onKeyDown={(event) => handleNameKeyDown(event, item)}
                  />
                  <div className="text-[10px] text-slate-400">
                    Enter — сохранить, Esc — отмена
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="flex flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-slate-50 active:bg-slate-100"
                onClick={handleOpen}
              >
                <div className="text-2xl" aria-hidden="true">
                  {icon}
                </div>

                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {item.name}
                  </div>

                  <div className="text-xs text-slate-500">
                    {typeLabel} • {formatSize(size)}
                  </div>
                </div>
              </button>
            )}

            <div className="mt-1 flex justify-end gap-1">
              <button
                type="button"
                className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full bg-slate-200 px-2 text-xs hover:bg-slate-300"
                onClick={() =>
                  isEditing ? cancelEditing() : startEditing(item)
                }
              >
                {isEditing ? "✕" : "✏"}
              </button>

              <button
                type="button"
                className="inline-flex min-h-8 min-w-8 items-center justify-center rounded-full bg-red-100 px-2 text-xs text-red-700 hover:bg-red-200"
                onClick={() => {
                  if (window.confirm(`Удалить "${item.name}"?`)) {
                    onDelete(item.id);
                  }
                }}
              >
                🗑
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const formatSize = (size: number | undefined): string => {
  if (
    !Number.isFinite(size) ||
    size === undefined ||
    size === null ||
    size < 0
  ) {
    return "0 B";
  }

  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
};
