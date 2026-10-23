import { ArrowRight, Check, Flag, LockKeyhole, Star } from "lucide-react";
import { LEVELS } from "@/lib/game";
type Props = {
  level: number;
  active: boolean;
  scores: number[];
  onSelect: (level: number) => void;
};
export function AdventureMap({ level, active, scores, onSelect }: Props) {
  const completed = scores.filter(Boolean).length;
  const first = scores.findIndex((n) => !n);
  const unlocked = first === -1 ? 9 : first;
  return (
    <aside className="journey-panel">
      <div className="journey-title">
        <div>
          <span className="eyebrow">ONE LITTLE STEP AT A TIME</span>
          <h2>Your adventure</h2>
        </div>
        <span className="journey-count">
          {completed}
          <span>/10</span>
        </span>
      </div>
      <div className="progress-track">
        <span style={{ width: `${completed * 10}%` }} />
      </div>
      <div className="level-list">
        {LEVELS.map((item, i) => (
          <button
            className={`level-item ${level === i && active ? "selected" : ""} ${scores[i] ? "completed" : ""}`}
            disabled={i > unlocked}
            key={item.name}
            onClick={() => {
              onSelect(i);
            }}
            aria-label={`Level ${i + 1}: ${item.name}${i > unlocked ? ", locked" : ""}${scores[i] ? `, ${scores[i]} stars` : ""}`}
            aria-current={level === i && active ? "step" : undefined}
          >
            <span className="level-number">
              {i > unlocked ? (
                <LockKeyhole size={13} />
              ) : scores[i] ? (
                <Check size={16} />
              ) : (
                String(i + 1).padStart(2, "0")
              )}
            </span>
            <span className="level-description">
              <strong>{item.name}</strong>
              <span>1 – {item.max.toLocaleString()}</span>
            </span>
            <span className="level-stars">
              {scores[i] ? (
                Array.from({ length: scores[i] }, (_, j) => (
                  <Star key={j} size={10} fill="currentColor" />
                ))
              ) : level === i && active ? (
                <ArrowRight size={16} />
              ) : null}
            </span>
          </button>
        ))}
      </div>
      <p className="journey-foot">
        <Flag size={13} /> Ten small challenges. One lovely journey.
      </p>
    </aside>
  );
}
