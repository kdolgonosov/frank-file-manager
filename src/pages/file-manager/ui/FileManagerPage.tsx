import { FileExplorer } from "@/widgets/file-explorer/ui/FileExplorer";

export const FileManagerPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-linear-to-r from-blue-600 to-violet-600 px-4 py-3 text-white">
        <h1 className="m-0 text-lg font-semibold">Файловый менеджер</h1>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-2 px-4 py-3">
        <FileExplorer />
      </main>
    </div>
  );
};
