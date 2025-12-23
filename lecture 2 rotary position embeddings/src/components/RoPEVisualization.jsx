import React, { useMemo, useState } from 'react'

// Convert degrees to radians
const toRadians = (deg) => (deg * Math.PI) / 180

// Rotation matrix application
function rotate(vector, angleDeg) {
  const angle = toRadians(angleDeg)
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return [
    vector[0] * cos - vector[1] * sin,
    vector[0] * sin + vector[1] * cos
  ]
}

// Generate a deterministic base embedding for a token (2D vector)
function generateBaseEmbedding(token, index) {
  // Create a consistent embedding based on token characters
  const seed = token.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0)
  const angle = ((seed % 360) + index * 30) % 360
  const magnitude = 0.7 + (seed % 30) / 100
  return [
    magnitude * Math.cos(toRadians(angle)),
    magnitude * Math.sin(toRadians(angle))
  ]
}

// Dot product of two 2D vectors
function dotProduct(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1]
}

// Get angle between two vectors in degrees
function angleBetween(v1, v2) {
  const dot = dotProduct(v1, v2)
  const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1])
  const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1])
  const cosAngle = dot / (mag1 * mag2)
  return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI)
}

// Color palette for tokens
const TOKEN_COLORS = [
  '#ff6b6b', // red
  '#4ecdc4', // teal
  '#45b7d1', // blue
  '#96ceb4', // green
  '#ffeaa7', // yellow
  '#dfe6e9', // gray
  '#fd79a8', // pink
  '#a29bfe', // purple
]

export default function RoPEVisualization({ phrase, currentStep, thetaBase, showComparison }) {
  const tokens = useMemo(() => phrase.split(' ').filter(t => t.length > 0), [phrase])
  const [selectedPair, setSelectedPair] = useState({ q: 0, k: 1 })

  // Generate base embeddings for each token
  const baseEmbeddings = useMemo(() =>
    tokens.map((token, i) => generateBaseEmbedding(token, i)),
    [tokens]
  )

  // Apply RoPE rotation to each embedding based on position
  const rotatedEmbeddings = useMemo(() =>
    baseEmbeddings.map((emb, pos) => rotate(emb, pos * thetaBase)),
    [baseEmbeddings, thetaBase]
  )

  // Compute attention scores using RoPE
  const ropeAttentionScores = useMemo(() => {
    return tokens.map((_, i) =>
      tokens.map((_, j) => {
        const qi = rotate(baseEmbeddings[i], i * thetaBase)
        const kj = rotate(baseEmbeddings[j], j * thetaBase)
        return dotProduct(qi, kj)
      })
    )
  }, [tokens, baseEmbeddings, thetaBase])

  // Compute traditional attention (no RoPE, just base embeddings)
  const traditionalAttentionScores = useMemo(() => {
    return tokens.map((_, i) =>
      tokens.map((_, j) => dotProduct(baseEmbeddings[i], baseEmbeddings[j]))
    )
  }, [tokens, baseEmbeddings])

  // Apply softmax to attention scores
  const applySoftmax = (scores) => {
    return scores.map(row => {
      const maxVal = Math.max(...row)
      const exps = row.map(v => Math.exp(v - maxVal))
      const sum = exps.reduce((a, b) => a + b, 0)
      return exps.map(v => v / sum)
    })
  }

  const ropeWeights = useMemo(() => applySoftmax(ropeAttentionScores), [ropeAttentionScores])
  const traditionalWeights = useMemo(() => applySoftmax(traditionalAttentionScores), [traditionalAttentionScores])

  // SVG dimensions for circle visualization
  const circleRadius = 150
  const svgSize = 400
  const center = svgSize / 2

  // Scale vector for display
  const scaleForDisplay = (v, scale = 130) => [v[0] * scale, -v[1] * scale] // Flip y for SVG

  return (
    <div className="rope-visualization">
      {/* Step 0: Input Tokens */}
      {currentStep === 0 && (
        <div className="step-section animate-slide-in">
          <h3 className="section-title">Step 1: Input Tokens</h3>
          <div className="tokens-row">
            {tokens.map((token, idx) => (
              <div
                key={idx}
                className="token-box"
                style={{ borderColor: TOKEN_COLORS[idx % TOKEN_COLORS.length] }}
              >
                <div className="token-text">{token}</div>
                <div className="token-position">pos = {idx}</div>
                {currentStep >= 1 && (
                  <div className="token-embedding">
                    [{baseEmbeddings[idx][0].toFixed(2)}, {baseEmbeddings[idx][1].toFixed(2)}]
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Rotation Matrix Introduction */}
      {currentStep === 1 && (
        <div className="step-section animate-slide-in">
          <h3 className="section-title">Step 2: The Rotation Matrix R(θ)</h3>
          <div className="rotation-matrix-display">
            <div className="matrix-explanation">
              <p>Position <strong>m</strong> rotates by angle <strong>θ<sub>m</sub> = m × θ<sub>base</sub></strong></p>
              <p className="theta-value">Current θ<sub>base</sub> = {thetaBase}°</p>
            </div>
            <div className="matrix-visual">
              <div className="matrix-bracket">[</div>
              <div className="matrix-content">
                <div className="matrix-row">
                  <span>cos(θ)</span>
                  <span>−sin(θ)</span>
                </div>
                <div className="matrix-row">
                  <span>sin(θ)</span>
                  <span>cos(θ)</span>
                </div>
              </div>
              <div className="matrix-bracket">]</div>
            </div>
            <div className="position-angles">
              {tokens.map((token, idx) => (
                <div key={idx} className="position-angle" style={{ color: TOKEN_COLORS[idx % TOKEN_COLORS.length] }}>
                  <span className="pos-label">{token}:</span>
                  <span className="angle-value">θ<sub>{idx}</sub> = {idx} × {thetaBase}° = {idx * thetaBase}°</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Position-Dependent Rotations - Unit Circle */}
      {currentStep === 2 && (
        <div className="step-section animate-slide-in">
          <h3 className="section-title">Step 3: Position-Dependent Rotations</h3>
          <div className="circle-container">
            <svg width={svgSize} height={svgSize} className="unit-circle-svg">
              {/* Circle */}
              <circle
                cx={center}
                cy={center}
                r={circleRadius}
                fill="none"
                stroke="#3a3a5a"
                strokeWidth="2"
              />
              {/* Axes */}
              <line x1={center - circleRadius - 20} y1={center} x2={center + circleRadius + 20} y2={center} stroke="#3a3a5a" strokeWidth="1" />
              <line x1={center} y1={center - circleRadius - 20} x2={center} y2={center + circleRadius + 20} stroke="#3a3a5a" strokeWidth="1" />

              {/* Base embeddings (faded) */}
              {currentStep >= 2 && baseEmbeddings.map((emb, idx) => {
                const [x, y] = scaleForDisplay(emb)
                return (
                  <g key={`base-${idx}`} opacity="0.3">
                    <line
                      x1={center} y1={center}
                      x2={center + x} y2={center + y}
                      stroke={TOKEN_COLORS[idx % TOKEN_COLORS.length]}
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />
                  </g>
                )
              })}

              {/* Rotated embeddings */}
              {rotatedEmbeddings.map((emb, idx) => {
                const [x, y] = scaleForDisplay(emb)
                const angle = idx * thetaBase
                return (
                  <g key={`rotated-${idx}`} className="vector-group">
                    {/* Arc showing rotation */}
                    {idx > 0 && (
                      <path
                        d={describeArc(center, center, 40, 0, angle)}
                        fill="none"
                        stroke={TOKEN_COLORS[idx % TOKEN_COLORS.length]}
                        strokeWidth="1"
                        opacity="0.5"
                      />
                    )}
                    {/* Vector arrow */}
                    <line
                      x1={center} y1={center}
                      x2={center + x} y2={center + y}
                      stroke={TOKEN_COLORS[idx % TOKEN_COLORS.length]}
                      strokeWidth="3"
                      markerEnd={`url(#arrow-${idx})`}
                    />
                    {/* Label */}
                    <text
                      x={center + x * 1.15}
                      y={center + y * 1.15}
                      fill={TOKEN_COLORS[idx % TOKEN_COLORS.length]}
                      fontSize="12"
                      textAnchor="middle"
                    >
                      {tokens[idx]} ({angle}°)
                    </text>
                  </g>
                )
              })}

              {/* Arrow markers */}
              <defs>
                {tokens.map((_, idx) => (
                  <marker
                    key={idx}
                    id={`arrow-${idx}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill={TOKEN_COLORS[idx % TOKEN_COLORS.length]}
                    />
                  </marker>
                ))}
              </defs>
            </svg>
            <div className="circle-legend">
              <p>Dashed lines: original embeddings</p>
              <p>Solid arrows: after position rotation</p>
              <p>Each position adds θ<sub>base</sub> = {thetaBase}° more rotation</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Q and K Rotation */}
      {currentStep === 3 && (
        <div className="step-section animate-slide-in">
          <h3 className="section-title">Step 4: Query and Key Rotation</h3>
          <div className="qk-visualization">
            <div className="qk-explanation">
              <p>Both Q and K vectors get rotated by their position:</p>
              <div className="qk-formula">
                q̃<sub>m</sub> = R(m·θ) · q<sub>m</sub>
                <br />
                k̃<sub>n</sub> = R(n·θ) · k<sub>n</sub>
              </div>
            </div>
            <div className="qk-circles">
              <div className="qk-circle-wrapper">
                <h4>Queries (Q)</h4>
                <svg width="250" height="250" className="mini-circle-svg">
                  <circle cx="125" cy="125" r="100" fill="none" stroke="#3a3a5a" strokeWidth="1" />
                  {rotatedEmbeddings.map((emb, idx) => {
                    const [x, y] = scaleForDisplay(emb, 90)
                    return (
                      <g key={idx}>
                        <line x1="125" y1="125" x2={125 + x} y2={125 + y}
                          stroke={TOKEN_COLORS[idx % TOKEN_COLORS.length]}
                          strokeWidth="2"
                        />
                        <text x={125 + x * 1.2} y={125 + y * 1.2}
                          fill={TOKEN_COLORS[idx % TOKEN_COLORS.length]}
                          fontSize="10" textAnchor="middle"
                        >Q{idx}</text>
                      </g>
                    )
                  })}
                </svg>
              </div>
              <div className="qk-circle-wrapper">
                <h4>Keys (K)</h4>
                <svg width="250" height="250" className="mini-circle-svg">
                  <circle cx="125" cy="125" r="100" fill="none" stroke="#3a3a5a" strokeWidth="1" />
                  {rotatedEmbeddings.map((emb, idx) => {
                    const [x, y] = scaleForDisplay(emb, 90)
                    return (
                      <g key={idx}>
                        <line x1="125" y1="125" x2={125 + x} y2={125 + y}
                          stroke={TOKEN_COLORS[idx % TOKEN_COLORS.length]}
                          strokeWidth="2"
                        />
                        <text x={125 + x * 1.2} y={125 + y * 1.2}
                          fill={TOKEN_COLORS[idx % TOKEN_COLORS.length]}
                          fontSize="10" textAnchor="middle"
                        >K{idx}</text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Angular Difference */}
      {currentStep === 4 && (
        <div className="step-section animate-slide-in">
          <h3 className="section-title">Step 5: Attention via Angular Difference</h3>
          <div className="angular-diff-container">
            <div className="key-insight">
              <p><strong>Key Insight:</strong> Q<sub>m</sub> · K<sub>n</sub> depends on <em>relative position</em> (m - n)</p>
              <p className="formula-detail">Attention ∝ cos((m - n) × θ<sub>base</sub>)</p>
            </div>

            <div className="pair-selector">
              <div className="selector-group">
                <label>Query position (m):</label>
                <select
                  value={selectedPair.q}
                  onChange={(e) => setSelectedPair({...selectedPair, q: Number(e.target.value)})}
                >
                  {tokens.map((t, i) => <option key={i} value={i}>{t} (pos {i})</option>)}
                </select>
              </div>
              <div className="selector-group">
                <label>Key position (n):</label>
                <select
                  value={selectedPair.k}
                  onChange={(e) => setSelectedPair({...selectedPair, k: Number(e.target.value)})}
                >
                  {tokens.map((t, i) => <option key={i} value={i}>{t} (pos {i})</option>)}
                </select>
              </div>
            </div>

            <div className="angle-calculation">
              <div className="calc-row">
                <span>Position difference:</span>
                <span className="calc-value">{selectedPair.q} - {selectedPair.k} = {selectedPair.q - selectedPair.k}</span>
              </div>
              <div className="calc-row">
                <span>Angular difference:</span>
                <span className="calc-value">{Math.abs(selectedPair.q - selectedPair.k)} × {thetaBase}° = {Math.abs(selectedPair.q - selectedPair.k) * thetaBase}°</span>
              </div>
              <div className="calc-row highlight">
                <span>cos(angle):</span>
                <span className="calc-value">{Math.cos(toRadians(Math.abs(selectedPair.q - selectedPair.k) * thetaBase)).toFixed(3)}</span>
              </div>
              <div className="calc-row">
                <span>Dot product:</span>
                <span className="calc-value">{ropeAttentionScores[selectedPair.q]?.[selectedPair.k]?.toFixed(3) || 0}</span>
              </div>
            </div>

            <div className="insight-box">
              <p>
                {Math.abs(selectedPair.q - selectedPair.k) === 0 && "Same position → 0° angle → Maximum attention!"}
                {Math.abs(selectedPair.q - selectedPair.k) === 1 && "Adjacent tokens → Small angle → High attention"}
                {Math.abs(selectedPair.q - selectedPair.k) >= 2 && "Distant tokens → Large angle → Lower attention"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Attention Heatmap */}
      {currentStep === 5 && (
        <div className="step-section animate-slide-in">
          <h3 className="section-title">Step 6: Attention Pattern (RoPE)</h3>
          <div className="heatmap-container">
            <div className="heatmap-wrapper">
              <div className="heatmap-label-top">
                <div className="heatmap-corner">Q↓ K→</div>
                {tokens.map((t, i) => (
                  <div key={i} className="heatmap-header" style={{ color: TOKEN_COLORS[i % TOKEN_COLORS.length] }}>{t}</div>
                ))}
              </div>
              {ropeWeights.map((row, i) => (
                <div key={i} className="heatmap-row">
                  <div className="heatmap-row-label" style={{ color: TOKEN_COLORS[i % TOKEN_COLORS.length] }}>{tokens[i]}</div>
                  {row.map((weight, j) => {
                    const angleDiff = Math.abs(i - j) * thetaBase
                    return (
                      <div
                        key={j}
                        className="heatmap-cell"
                        style={{
                          backgroundColor: `rgba(255, 127, 80, ${weight})`,
                          color: weight > 0.3 ? '#fff' : '#888'
                        }}
                        title={`${tokens[i]}→${tokens[j]}: ${(weight * 100).toFixed(0)}% (Δθ=${angleDiff}°)`}
                      >
                        {(weight * 100).toFixed(0)}%
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="heatmap-insight">
              <p>Notice: Diagonal has highest attention (same position = 0° difference)</p>
              <p>Attention decays smoothly with distance due to increasing angular difference</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Comparison with Traditional */}
      {currentStep === 6 && (
        <div className="step-section animate-slide-in">
          <h3 className="section-title">Step 7: RoPE vs Traditional Positional Embeddings</h3>
          <div className="comparison-container">
            <div className="comparison-grid">
              <div className="comparison-panel rope-panel">
                <h4>RoPE (Rotary)</h4>
                <div className="mini-heatmap">
                  {ropeWeights.map((row, i) => (
                    <div key={i} className="mini-heatmap-row">
                      {row.map((weight, j) => (
                        <div
                          key={j}
                          className="mini-heatmap-cell"
                          style={{ backgroundColor: `rgba(255, 127, 80, ${weight})` }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <ul className="comparison-features">
                  <li>Encodes <strong>relative</strong> position</li>
                  <li>Smooth decay with distance</li>
                  <li>Generalizes to longer sequences</li>
                  <li>No separate position vectors needed</li>
                </ul>
              </div>
              <div className="comparison-panel traditional-panel">
                <h4>Traditional (Absolute)</h4>
                <div className="mini-heatmap">
                  {traditionalWeights.map((row, i) => (
                    <div key={i} className="mini-heatmap-row">
                      {row.map((weight, j) => (
                        <div
                          key={j}
                          className="mini-heatmap-cell"
                          style={{ backgroundColor: `rgba(100, 149, 237, ${weight})` }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <ul className="comparison-features">
                  <li>Encodes <strong>absolute</strong> position</li>
                  <li>Position added to embeddings</li>
                  <li>Fixed sequence length limit</li>
                  <li>Separate position vectors</li>
                </ul>
              </div>
            </div>
            <div className="comparison-summary">
              <p><strong>Why RoPE is better:</strong> By encoding relative positions through rotation angles,
              RoPE allows the model to naturally understand that "cat sat" has the same relationship
              regardless of where it appears in the sequence. This enables better generalization to
              sequences longer than those seen during training.</p>
              <p className="see-math-note">
                See the <strong>RoPE Math</strong> visualization for the full mathematical derivation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to create an SVG arc path
function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ")
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = toRadians(angleInDegrees - 90)
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  }
}
