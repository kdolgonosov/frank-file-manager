import type { FileNode, FsNode } from "@/entities/fs/model/types";

/**
 * Рекурсивно считает суммарный размер содержимого папки (всех файлов в поддереве).
 */
export const computeFolderSize = (
  nodes: Record<string, FsNode>,
  folderId: string
): number => {
  let total = 0;

  for (const node of Object.values(nodes)) {
    if (node.parentId !== folderId) continue;

    if (node.type === "file") {
      total += (node as FileNode).size;
    } else if (node.type === "folder") {
      total += computeFolderSize(nodes, node.id);
    }
  }

  return total;
};

/**
 * Универсальная функция для получения "размера" узла:
 * - для файлов — размер файла
 * - для папок — сумма размеров всех файлов в поддереве
 */
export const getNodeSizeFromMap = (
  nodes: Record<string, FsNode>,
  node: FsNode
): number => {
  if (node.type === "file") {
    return (node as FileNode).size;
  }
  return computeFolderSize(nodes, node.id);
};
