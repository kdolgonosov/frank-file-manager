export type NodeType = "file" | "folder";

export interface BaseNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  createdAt: string;
}

export interface FileNode extends BaseNode {
  type: "file";
  size: number;
  mimeType: string;
  content: string;
}

export interface FolderNode extends BaseNode {
  type: "folder";
}

export type FsNode = FileNode | FolderNode;

export type FsMap = Record<string, FsNode>;
