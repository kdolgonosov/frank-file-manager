import type { FsNode } from "@/entities/fs/model/types";

export type FileKind =
  | "folder"
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "text"
  | "archive"
  | "other";

export const detectFileKind = (item: FsNode): FileKind => {
  if (item.type === "folder") return "folder";

  const mime = item.mimeType as string | undefined;
  const name = item.name.toLowerCase();

  if (mime?.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/.test(name)) {
    return "image";
  }

  if (mime?.startsWith("video/") || /\.(mp4|webm|mov|avi)$/.test(name)) {
    return "video";
  }

  if (mime?.startsWith("audio/") || /\.(mp3|wav|ogg|flac)$/.test(name)) {
    return "audio";
  }

  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    return "pdf";
  }

  if (
    mime?.startsWith("text/") ||
    /\.(txt|md|csv|log|json|yaml|yml|xml|html|css|js|ts|tsx)$/.test(name)
  ) {
    return "text";
  }

  if (
    /\.(zip|rar|7z|tar|gz|bz2)$/.test(name) ||
    mime === "application/zip" ||
    mime === "application/x-7z-compressed"
  ) {
    return "archive";
  }

  return "other";
};

export const getFileTypeLabel = (kind: FileKind): string => {
  switch (kind) {
    case "folder":
      return "Папка";
    case "image":
      return "Изображение";
    case "video":
      return "Видео";
    case "audio":
      return "Аудио";
    case "pdf":
      return "PDF-документ";
    case "text":
      return "Текстовый файл";
    case "archive":
      return "Архив";
    case "other":
    default:
      return "Файл";
  }
};

export const getFileTypeIcon = (kind: FileKind): string => {
  switch (kind) {
    case "folder":
      return "📁";
    case "image":
      return "🖼️";
    case "video":
      return "🎬";
    case "audio":
      return "🎵";
    case "pdf":
      return "📄";
    case "text":
      return "📄";
    case "archive":
      return "📦";
    case "other":
    default:
      return "📦";
  }
};
