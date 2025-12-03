import { useState } from "react";

import type { FileNode, FolderNode, FsMap, FsNode } from "../model/types";

const STORAGE_KEY = "file-manager-v1";

const createInitialState = (): FsMap => {
  const rootId = "root";
  const root: FolderNode = {
    id: rootId,
    name: "Root",
    type: "folder",
    parentId: null,
    createdAt: new Date().toISOString(),
  };

  return { [rootId]: root };
};

const loadFromStorage = (): FsMap => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as FsMap;
    }
  } catch (error) {
    console.warn("Failed to load file system from storage", error);
  }

  return createInitialState();
};

const isQuotaExceeded = (error: unknown): boolean => {
  if (!(error instanceof DOMException)) return false;

  return error.name === "QuotaExceededError";
};

/**
 * Возвращает уникальное имя в рамках одной папки.
 * Если имя свободно — вернёт его же.
 * Если занято — добавляет " (2)", " (3)" и т.д.
 * Для файлов сохраняет расширение: "file.txt" -> "file (2).txt".
 */
const getUniqueName = (
  nodes: FsMap,
  parentId: string,
  desiredName: string,
  selfId?: string
): string => {
  const trimmed = desiredName.trim();
  if (!trimmed) return desiredName;

  const siblings = Object.values(nodes).filter(
    (node) => node.parentId === parentId && node.id !== selfId
  );

  const exists = (name: string) => siblings.some((node) => node.name === name);

  if (!exists(trimmed)) return trimmed;

  // разбиваем на имя и расширение
  const lastDotIndex = trimmed.lastIndexOf(".");
  const hasExtension = lastDotIndex > 0;
  const base = hasExtension ? trimmed.slice(0, lastDotIndex) : trimmed;
  const ext = hasExtension ? trimmed.slice(lastDotIndex) : "";

  let counter = 2;
  // "name (2)", "name (3)", ...
  while (true) {
    const candidate = `${base} (${counter})${ext}`;
    if (!exists(candidate)) {
      return candidate;
    }
    counter++;
  }
};

export const useFileSystem = () => {
  const [nodes, setNodes] = useState<FsMap>(() => loadFromStorage());
  const [error, setError] = useState<string | null>(null);

  /**
   * Централизованное применение изменений.
   * Если localStorage забит — откатываемся.
   */
  const applyUpdate = (updater: (prev: FsMap) => FsMap) => {
    setNodes((prev) => {
      const next = updater(prev);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setError(null);
        return next;
      } catch (err) {
        if (isQuotaExceeded(err)) {
          console.warn("localStorage quota exceeded", err);
          setError(
            "Недостаточно места в хранилище браузера. Удалите один или несколько файлов и попробуйте ещё раз."
          );
        } else {
          console.warn("Failed to save file system to storage", err);
          setError("Не удалось сохранить изменения в хранилище браузера.");
        }

        // откат к prev
        return prev;
      }
    });
  };

  const getChildren = (parentId: string): FsNode[] => {
    const arr = Object.values(nodes).filter(
      (node) => node.parentId === parentId
    );

    return arr.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }

      return a.name.localeCompare(b.name);
    });
  };

  const getPath = (folderId: string) => {
    const path: FolderNode[] = [];
    let current: FsNode | undefined = nodes[folderId];

    while (current && current.type === "folder") {
      path.unshift(current);
      if (current.parentId === null) break;
      current = nodes[current.parentId];
    }

    return path;
  };

  const createFolder = (name: string, parentId: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    applyUpdate((prev) => {
      const id = `folder-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const uniqueName = getUniqueName(prev, parentId, trimmed);

      const newFolder: FolderNode = {
        id,
        name: uniqueName,
        type: "folder",
        parentId,
        createdAt: new Date().toISOString(),
      };

      return {
        ...prev,
        [id]: newFolder,
      };
    });
  };

  const renameNode = (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    applyUpdate((prev) => {
      const node = prev[id];
      if (!node) return prev;

      const parentId = node.parentId ?? "root";
      const uniqueName = getUniqueName(prev, parentId, trimmed, id);

      if (uniqueName === node.name) return prev;

      return {
        ...prev,
        [id]: {
          ...node,
          name: uniqueName,
        },
      };
    });
  };

  const deleteNode = (id: string) => {
    if (id === "root") return;

    applyUpdate((prev) => {
      const next: FsMap = { ...prev };

      const removeRecursive = (targetId: string) => {
        Object.values(next).forEach((node) => {
          if (node.parentId === targetId) {
            removeRecursive(node.id);
          }
        });
        delete next[targetId];
      };

      removeRecursive(id);

      return next;
    });
  };

  const uploadFiles = async (files: FileList, parentId: string) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    const fileNodes: FileNode[] = await Promise.all(
      fileArray.map(
        (file) =>
          new Promise<FileNode>((resolve) => {
            const reader = new FileReader();

            reader.onload = () => {
              const id = `file-${Date.now()}-${Math.random()
                .toString(16)
                .slice(2)}`;
              const node: FileNode = {
                id,
                name: file.name,
                type: "file",
                parentId,
                createdAt: new Date().toISOString(),
                size: file.size,
                mimeType: file.type || "application/octet-stream",
                content: String(reader.result ?? ""),
              };

              resolve(node);
            };

            reader.readAsDataURL(file);
          })
      )
    );

    applyUpdate((prev) => {
      const next: FsMap = { ...prev };

      fileNodes.forEach((fileNode) => {
        const uniqueName = getUniqueName(
          next,
          fileNode.parentId!,
          fileNode.name
        );
        next[fileNode.id] = {
          ...fileNode,
          name: uniqueName,
        };
      });

      return next;
    });
  };

  /**
   * Полная очистка (reset к initial state)
   */
  const clearAll = () => {
    const initial = createInitialState();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      setNodes(initial);
      setError(null);
    } catch (err) {
      console.warn("Failed to reset file system", err);
      setError("Не удалось очистить хранилище.");
    }
  };

  return {
    nodes,
    error,
    getChildren,
    getPath,
    createFolder,
    renameNode,
    deleteNode,
    uploadFiles,
    clearAll,
  };
};
