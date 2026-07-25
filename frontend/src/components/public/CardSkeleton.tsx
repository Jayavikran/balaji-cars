export default function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#111a2c] border border-line dark:border-white/10 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-surface dark:bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 w-3/4 bg-surface dark:bg-white/5 rounded" />
        <div className="h-5 w-1/2 bg-surface dark:bg-white/5 rounded" />
        <div className="h-2.5 w-full bg-surface dark:bg-white/5 rounded" />
        <div className="h-2.5 w-2/3 bg-surface dark:bg-white/5 rounded" />
        <div className="h-9 w-full bg-surface dark:bg-white/5 rounded-xl mt-2" />
      </div>
    </div>
  );
}