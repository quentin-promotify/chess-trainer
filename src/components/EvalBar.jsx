export default function EvalBar({ evaluation, playerColor, height = 480 }) {
  const MAX = 10;
  const capped = Math.max(-MAX, Math.min(MAX, evaluation ?? 0));

  const whitePct =
    evaluation === Infinity ? 100 :
    evaluation === -Infinity ? 0 :
    ((capped + MAX) / (MAX * 2)) * 100;
  const blackPct = 100 - whitePct;

  const label =
    evaluation === Infinity || evaluation === -Infinity
      ? 'M'
      : Math.abs(evaluation ?? 0).toFixed(1);

  return (
    <div className="eval-bar" style={{ height }} title={`Evaluation: ${(evaluation ?? 0) > 0 ? '+' : ''}${label}`}>
      <div className="eval-black" style={{ height: `${blackPct}%` }}>
        {evaluation < -1 && <span className="eval-label">{label}</span>}
      </div>
      <div className="eval-white" style={{ height: `${whitePct}%` }}>
        {evaluation > 1 && <span className="eval-label">{label}</span>}
      </div>
    </div>
  );
}
