import React, { useMemo, useState } from "react";

import { useFileSystem } from "@/entities/fs/hooks/useFileSystem";
import type { FileNode, FsNode } from "@/entities/fs/model/types";
import { formatBytes } from "@/shared/lib/formatBytes";
import { CreateFolderButton } from "@/features/create-folder/ui/CreateFolderButton";
import { UploadFilesButton } from "@/features/upload-files/ui/UploadFilesButton";
import { Breadcrumbs, Toolbar, FileGrid } from "@/shared/ui";
import { FileTable } from "@/shared/ui/FileTable/FileTable";
import { getNodeSizeFromMap } from "@/entities/fs/lib/nodeSize";

type ViewMode = "grid" | "list";
type SortField = "name" | "type" | "date" | "size";
type SortDir = "asc" | "desc";

export const FileExplorer: React.FC = () => {
  const {
    nodes,
    error,
    getChildren,
    getPath,
    createFolder,
    renameNode,
    deleteNode,
    uploadFiles,
    clearAll,
  } = useFileSystem();

  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const currentFolder = nodes[currentFolderId];
  const rawItems = getChildren(currentFolderId);
  const path = getPath(currentFolderId);

  const canGoUp = Boolean(currentFolder && currentFolder.parentId !== null);

  const handleGoUp = () => {
    if (!currentFolder || currentFolder.parentId === null) return;
    setCurrentFolderId(currentFolder.parentId);
  };

  const handleDownloadFile = (id: string) => {
    const node = nodes[id];
    if (!node || node.type !== "file" || !node.content) return;

    const link = document.createElement("a");
    link.href = node.content;
    link.download = node.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const usedBytes = useMemo(() => {
    return Object.values(nodes).reduce((acc, node) => {
      if (node.type === "file") {
        return acc + (node as FileNode).size;
      }
      return acc;
    }, 0);
  }, [nodes]);

  const usedFormatted = formatBytes(usedBytes);

  const sortedItems = useMemo(() => {
    const items = [...rawItems];

    items.sort((a, b) => {
      let cmp = 0;

      switch (sortField) {
        case "name": {
          cmp = a.name.localeCompare(b.name, undefined, {
            sensitivity: "base",
          });
          break;
        }
        case "type": {
          // Папки в начало, потом файлы
          const aType = a.type === "folder" ? 0 : 1;
          const bType = b.type === "folder" ? 0 : 1;
          cmp = aType - bType;
          if (cmp === 0) {
            cmp = a.name.localeCompare(b.name, undefined, {
              sensitivity: "base",
            });
          }
          break;
        }
        case "date": {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          cmp = aTime - bTime;
          break;
        }
        case "size": {
          const aSize = getNodeSizeFromMap(nodes, a);
          const bSize = getNodeSizeFromMap(nodes, b);
          cmp = aSize - bSize;
          if (cmp === 0) {
            cmp = a.name.localeCompare(b.name, undefined, {
              sensitivity: "base",
            });
          }
          break;
        }
      }

      return sortDir === "asc" ? cmp : -cmp;
    });

    return items;
  }, [rawItems, sortField, sortDir, nodes]); // getNodeSizeFromMap — чистая функция, завязана только на nodes

  const handleClearAll = () => {
    if (
      window.confirm(
        "Очистить всё хранилище файлового менеджера? Это действие нельзя отменить."
      )
    ) {
      clearAll();
      setCurrentFolderId("root");
    }
  };

  const toggleSortDir = () => {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const getNodeSize = (node: FsNode) => getNodeSizeFromMap(nodes, node);

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumbs path={path} onNavigate={(id) => setCurrentFolderId(id)} />

      <Toolbar
        canGoUp={canGoUp}
        onGoUp={handleGoUp}
        leftSlot={
          <CreateFolderButton
            onCreateFolder={(name) => createFolder(name, currentFolderId)}
          />
        }
        rightSlot={
          <div className="flex flex-wrap items-center gap-2">
            {/* Сортировка */}
            <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs">
              <span className="hidden text-slate-500 sm:inline">
                Сортировка:
              </span>
              <select
                className="rounded-full bg-white px-2 py-1 text-xs text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-blue-400"
                value={sortField}
                onChange={(event) =>
                  setSortField(event.target.value as SortField)
                }
              >
                <option value="name">Имя</option>
                <option value="type">Тип</option>
                <option value="date">Дата</option>
                <option value="size">Размер</option>
              </select>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                onClick={toggleSortDir}
                title={sortDir === "asc" ? "По возрастанию" : "По убыванию"}
              >
                {sortDir === "asc" ? "↑" : "↓"}
              </button>
            </div>

            {/* Переключатель режимов */}
            <div className="inline-flex items-center rounded-full bg-slate-200 p-0.5 text-xs">
              <button
                type="button"
                className={
                  "inline-flex min-h-8 items-center justify-center rounded-full px-2 " +
                  (viewMode === "grid"
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-600")
                }
                onClick={() => setViewMode("grid")}
              >
                Плитка
              </button>
              <button
                type="button"
                className={
                  "inline-flex min-h-8 items-center justify-center rounded-full px-2 " +
                  (viewMode === "list"
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-600")
                }
                onClick={() => setViewMode("list")}
              >
                Список
              </button>
            </div>

            <UploadFilesButton
              onUploadFiles={(files) => uploadFiles(files, currentFolderId)}
            />
          </div>
        }
      />

      {error && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <section>
        {viewMode === "grid" ? (
          <FileGrid
            items={sortedItems}
            onOpenFolder={(id) => setCurrentFolderId(id)}
            onDownloadFile={handleDownloadFile}
            onRename={renameNode}
            onDelete={deleteNode}
            getNodeSize={getNodeSize}
          />
        ) : (
          <FileTable
            items={sortedItems}
            onOpenFolder={(id) => setCurrentFolderId(id)}
            onDownloadFile={handleDownloadFile}
            onRename={renameNode}
            onDelete={deleteNode}
            getNodeSize={getNodeSize}
          />
        )}
      </section>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          Занято места:{" "}
          <span className="font-mono text-slate-700">{usedFormatted}</span>{" "}
          <span className="text-slate-400">(лимит ≈ 5–10 MB)</span>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100"
          onClick={handleClearAll}
        >
          Очистить хранилище
        </button>
      </div>
    </div>
  );
};
