/**
 * Emblema do capítulo: um círculo contendo a constelação do Cruzeiro do Sul,
 * substituindo o placeholder "círculo com X" do wireframe original.
 * As 5 estrelas seguem (de forma estilizada) a posição real da constelação.
 */
export default function StarEmblem({ size = 72, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Emblema Guardiões do Cruzeiro do Sul"
    >
      <circle cx="50" cy="50" r="47" fill="var(--surface, #131b36)" stroke="var(--gold, #d4af6a)" strokeWidth="2" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--gold, #d4af6a)" strokeWidth="0.75" opacity="0.5" />

      {/* Linhas da cruz */}
      <line x1="50" y1="24" x2="50" y2="68" stroke="var(--gold, #d4af6a)" strokeWidth="1" opacity="0.55" />
      <line x1="34" y1="60" x2="66" y2="42" stroke="var(--gold, #d4af6a)" strokeWidth="1" opacity="0.55" />

      {/* As 5 estrelas do Cruzeiro do Sul (Alpha, Beta, Gamma, Delta e Epsilon Crucis) */}
      <Star cx="50" cy="24" r="3.6" />
      <Star cx="50" cy="68" r="3.6" />
      <Star cx="34" cy="60" r="3.2" />
      <Star cx="66" cy="42" r="3.2" />
      <Star cx="58" cy="55" r="1.8" />
    </svg>
  );
}

function Star({ cx, cy, r }) {
  return (
    <circle cx={cx} cy={cy} r={r} fill="var(--starlight, #f2f0e9)">
      <animate
        attributeName="opacity"
        values="0.65;1;0.65"
        dur="3.2s"
        begin={`${(cx + cy) % 3}s`}
        repeatCount="indefinite"
      />
    </circle>
  );
}
