"use client";

interface TimeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const TIME_POINTS = [0, 10, 50, 66, 100, 150, 200];

function formatTime(value: number) {
  if (value === 0) return "Present";
  return `${value} million years ago`;
}

export default function TimeSlider({
  value,
  onChange,
}: TimeSliderProps) {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">
            Deep Time
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-white">
            {formatTime(value)}
          </h2>
        </div>

        <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">
          {value === 0 ? "Today" : `${value} Ma`}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={200}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full cursor-pointer accent-cyan-400"
        aria-label="Select geological time"
      />

      <div className="mt-3 flex justify-between text-xs text-white/40">
        <span>Present</span>
        <span>50 Ma</span>
        <span>100 Ma</span>
        <span>150 Ma</span>
        <span>200 Ma</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {TIME_POINTS.map((time) => (
          <button
            key={time}
            type="button"
            onClick={() => onChange(time)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              value === time
                ? "border-cyan-400 bg-cyan-400/20 text-cyan-300"
                : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
            }`}
          >
            {time === 0 ? "Present" : `${time} Ma`}
          </button>
        ))}
      </div>
    </div>
  );
}