interface CreateFolderButtonProps {
  onCreateFolder: (name: string) => void;
}

export const CreateFolderButton = ({
  onCreateFolder,
}: CreateFolderButtonProps) => {
  const handleClick = () => {
    const name = window.prompt("Название папки", "Новая папка");
    if (name) onCreateFolder(name);
  };

  return (
    <button
      type="button"
      className="inline-flex min-h-10 items-center justify-center rounded-full bg-slate-200 px-3 text-sm hover:bg-slate-300"
      onClick={handleClick}
    >
      📁 Новая папка
    </button>
  );
};
