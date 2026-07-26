/** Reusable skeleton placeholder matching CarCard's shape, shown while listings load. */
export default function CardSkeleton() {
  return (
    <div className="rounded-2xl sm:rounded-card bg-white dark:bg-[#111a2c] border border-line dark:border-white/10 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] sm:aspect-[16/9] bg-surface dark:bg-white/5" />
      <div className="p-2.5 sm:p-5 space-y-2 sm:space-y-3">
        <div className="h-3.5 sm:h-4 w-3/4 bg-surface dark:bg-white/5 rounded" />
        <div className="h-5 sm:h-6 w-1/2 bg-surface dark:bg-white/5 rounded" />
        <div className="h-3 w-full bg-surface dark:bg-white/5 rounded" />
        <div className="h-9 sm:h-11 w-full bg-surface dark:bg-white/5 rounded-xl mt-3 sm:mt-4" />
      </div>
    </div>
  );
}
