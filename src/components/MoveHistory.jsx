export default function MoveHistory({ history }) {
  const pairs = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({ white: history[i], black: history[i + 1] });
  }

  return (
    <div className="move-history">
      <div className="move-history-header">Moves</div>
      <div className="move-history-list">
        {pairs.map((pair, idx) => (
          <div key={idx} className="move-pair">
            <span className="move-number">{idx + 1}.</span>
            <span className="move">{pair.white?.san ?? ''}</span>
            <span className="move">{pair.black?.san ?? ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
