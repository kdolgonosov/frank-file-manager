import { type ChangeEvent } from "react";

interface UploadFilesButtonProps {
  onUploadFiles: (files: FileList) => void | Promise<void>;
}

export const UploadFilesButton = ({
  onUploadFiles,
}: UploadFilesButtonProps) => {
  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && files.length) {
      await onUploadFiles(files);
      event.target.value = "";
    }
  };

  return (
    <label className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700">
      <input type="file" multiple className="hidden" onChange={handleChange} />
      <span>⬆ Загрузить файлы</span>
    </label>
  );
};
