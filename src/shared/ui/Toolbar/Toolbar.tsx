interface ToolbarProps {
  canGoUp: boolean;
  onGoUp: () => void;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export const Toolbar = ({
  canGoUp,
  onGoUp,
  leftSlot,
  rightSlot,
}: ToolbarProps) => {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-slate-200 px-3 text-sm disabled:cursor-default disabled:opacity-50 hover:bg-slate-300 disabled:hover:bg-slate-200"
          onClick={onGoUp}
          disabled={!canGoUp}
        >
          ⬆ Вверх
        </button>
        {leftSlot}
      </div>

      <div className="flex items-center gap-2">{rightSlot}</div>
    </div>
  );
};
