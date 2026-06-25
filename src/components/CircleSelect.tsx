"use client";

type Props = {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
};

export default function CircleSelect({ options, value, onChange, label }: Props) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {label && <span className="text-sm text-gray-500 ml-2">{label}</span>}
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt === value ? "" : opt)}
          className={`px-3 py-0.5 text-sm transition-all rounded-full border ${
            value === opt
              ? "border-gray-800 border-2 font-medium"
              : "border-transparent text-gray-600"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
