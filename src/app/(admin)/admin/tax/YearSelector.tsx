"use client";

interface YearSelectorProps {
  years: number[];
  current: number;
}

export function YearSelector({ years, current }: YearSelectorProps) {
  return (
    <form method="GET">
      <select
        name="year"
        defaultValue={current}
        onChange={(e) => {
          (e.target.closest("form") as HTMLFormElement).submit();
        }}
        className="border border-border rounded-md px-3 py-1.5 text-sm bg-background text-foreground"
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </form>
  );
}
