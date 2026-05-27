export default function Controls({
  onHint,
  onReset,
  onToggleEval,
  showEvalBar,
  onSkillChange,
  isThinking,
  playerColor,
  onColorChange,
}) {
  return (
    <div className="controls">
      <button onClick={onHint} disabled={isThinking}>
        Hint
      </button>
      <button onClick={onToggleEval}>
        {showEvalBar ? 'Hide Eval' : 'Show Eval'}
      </button>
      <button onClick={onReset}>
        New Game
      </button>
      <label className="control-label">
        Play as
        <select
          value={playerColor}
          onChange={(e) => onColorChange(e.target.value)}
        >
          <option value="white">White</option>
          <option value="black">Black</option>
        </select>
      </label>
      <label className="control-label">
        Bot Level
        <input
          type="range"
          min={0}
          max={20}
          defaultValue={10}
          onChange={(e) => onSkillChange(Number(e.target.value))}
        />
      </label>
      {isThinking && <span className="thinking-indicator">Bot is thinking…</span>}
    </div>
  );
}
