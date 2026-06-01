export default function EvalBar({ evaluation, playerColor, height = 480 }) {
  const MAX = 10;
  const normalEval = evaluation === Infinity  ?  MAX :
                     evaluation === -Infinity ? -MAX :
                     Math.max(-MAX, Math.min(MAX, evaluation ?? 0));

  const whitePct = ((normalEval + MAX) / (MAX * 2)) * 100;
  const blackPct = 100 - whitePct;

  const scoreLabel = (() => {
    if (evaluation === Infinity)  return 'M';
    if (evaluation === -Infinity) return '-M';
    if (normalEval === 0) return '0.0';
    const sign = normalEval > 0 ? '+' : '';
    return `${sign}${normalEval.toFixed(1)}`;
  })();

  return (
    <div
      className="eval-bar"
      style={{ height, position: 'relative' }}
      title={`Evaluation: ${normalEval > 0 ? '+' : ''}${scoreLabel}`}
    >
      <div className="eval-black" style={{ height: `${blackPct}%` }} />
      <div className="eval-white" style={{ height: `${whitePct}%` }} />
      <div style={{
        position: 'absolute',
        ...(normalEval >= 0 ? { bottom: '4px' } : { top: '4px' }),
        width: '100%',
        textAlign: 'center',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: normalEval >= 0 ? '#000000' : '#ffffff',
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        {scoreLabel}
      </div>
    </div>
  );
}
