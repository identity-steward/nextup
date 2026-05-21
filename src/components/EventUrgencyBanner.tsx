interface EventUrgencyBannerProps {
  onScrollToAthletes?: () => void;
}

export default function EventUrgencyBanner({ onScrollToAthletes }: EventUrgencyBannerProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 shadow-[0_4px_28px_rgba(234,88,12,0.45)]">
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_60px,rgba(0,0,0,0.06)_60px,rgba(0,0,0,0.06)_61px)] pointer-events-none" />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/25" />
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/25" />
      <button
        onClick={onScrollToAthletes}
        className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5 py-4 px-6 text-center group"
      >
        <span className="flex items-center gap-2.5 font-black text-white text-base md:text-lg uppercase tracking-wide drop-shadow">
          <span className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
          Memphis Youth Athletes Need Your Support
        </span>
        <span className="hidden sm:block w-px h-5 bg-white/30" />
        <span className="flex items-center gap-2 bg-white text-orange-600 font-black text-sm px-5 py-2 rounded-full group-hover:bg-amber-50 transition-colors shadow-lg uppercase tracking-wide">
          Support Athletes Now
          <span className="group-hover:translate-x-0.5 transition-transform inline-block">&#x2192;</span>
        </span>
      </button>
    </div>
  );
}
