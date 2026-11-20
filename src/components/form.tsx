import type { ReactNode } from "react";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="muted">{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, type = "text", inputMode }: { value: string; onChange: (value: string) => void; placeholder?: string; type?: string; inputMode?: "decimal" | "url" | "text" }) {
  return <input className="input" type={type} inputMode={inputMode} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />;
}

export function TextArea({ value, onChange, placeholder, rows = 4 }: { value: string; onChange: (value: string) => void; placeholder?: string; rows?: number }) {
  return <textarea className="input textarea" rows={rows} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />;
}

export function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: { key: string; label: string }[] }) {
  return (
    <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.key} value={option.key}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** 여러 개를 고르는 칩이에요. */
export function MultiChips({ items, selected, onChange }: { items: { key: string; label: string }[]; selected: string[]; onChange: (next: string[]) => void }) {
  return (
    <div className="chips wrap">
      {items.map((item) => {
        const on = selected.includes(item.key);
        return (
          <button key={item.key} type="button" className={`chip${on ? " is-on" : ""}`} aria-pressed={on} onClick={() => onChange(on ? selected.filter((key) => key !== item.key) : [...selected, item.key])}>
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/** 하나만 고르는 칩이에요. */
export function SingleChips({ items, selected, onChange }: { items: { key: string; label: string }[]; selected: string; onChange: (next: string) => void }) {
  return (
    <div className="chips wrap">
      {items.map((item) => (
        <button key={item.key} type="button" className={`chip${item.key === selected ? " is-on" : ""}`} aria-pressed={item.key === selected} onClick={() => onChange(item.key)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function SaveBar({ label, busy, disabled, onSave, extra }: { label: string; busy: boolean; disabled?: boolean; onSave: () => void; extra?: ReactNode }) {
  return (
    <div className="bottom-actions">
      {extra}
      <button type="button" className="button" disabled={busy || disabled} onClick={onSave}>
        {label}
      </button>
    </div>
  );
}
