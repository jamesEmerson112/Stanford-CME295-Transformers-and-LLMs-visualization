import React, { useMemo, useState } from 'react'

// ============ SIMILARITY FUNCTIONS ============

function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0))
}

function manhattanDistance(a, b) {
  return a.reduce((sum, val, i) => sum + Math.abs(val - b[i]), 0)
}

function dotProduct(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0)
}

function magnitude(v) {
  return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0))
}

function cosineSimilarity(a, b) {
  const dot = dotProduct(a, b)
  const magA = magnitude(a)
  const magB = magnitude(b)
  if (magA === 0 || magB === 0) return 0
  return dot / (magA * magB)
}

function pearsonCorrelation(a, b) {
  const meanA = a.reduce((s, v) => s + v, 0) / a.length
  const meanB = b.reduce((s, v) => s + v, 0) / b.length
  const centeredA = a.map(v => v - meanA)
  const centeredB = b.map(v => v - meanB)
  return cosineSimilarity(centeredA, centeredB)
}

function jaccardSimilarity(a, b) {
  let intersection = 0, union = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] || b[i]) union++
    if (a[i] && b[i]) intersection++
  }
  return union === 0 ? 0 : intersection / union
}

// ============ PRESET EXAMPLES ============

const PRESET_EXAMPLES = {
  analogy: {
    name: 'King-Queen Analogy',
    description: 'Classic word analogy: king - man + woman = queen',
    vectors: {
      king: [0.8, 0.3],
      queen: [0.75, 0.35],
      man: [0.6, 0.2],
      woman: [0.55, 0.25]
    },
    vectors3D: {
      king: [0.8, 0.3, 0.5],
      queen: [0.75, 0.35, 0.55],
      man: [0.6, 0.2, 0.3],
      woman: [0.55, 0.25, 0.35]
    }
  },
  categories: {
    name: 'Animals vs Vehicles',
    description: 'Different semantic categories should be far apart',
    vectors: {
      cat: [0.7, 0.8],
      dog: [0.65, 0.85],
      car: [-0.6, 0.3],
      bus: [-0.55, 0.35]
    },
    vectors3D: {
      cat: [0.7, 0.8, 0.2],
      dog: [0.65, 0.85, 0.25],
      car: [-0.6, 0.3, 0.7],
      bus: [-0.55, 0.35, 0.65]
    }
  },
  sentiment: {
    name: 'Sentiment Words',
    description: 'Positive vs negative sentiment words',
    vectors: {
      happy: [0.9, 0.5],
      good: [0.85, 0.55],
      sad: [-0.8, 0.5],
      bad: [-0.75, 0.55]
    },
    vectors3D: {
      happy: [0.9, 0.5, 0.3],
      good: [0.85, 0.55, 0.25],
      sad: [-0.8, 0.5, 0.3],
      bad: [-0.75, 0.55, 0.25]
    }
  }
}

// Color palette
const VECTOR_COLORS = {
  king: '#ff7f50',
  queen: '#ffd700',
  man: '#4ade80',
  woman: '#60a5fa',
  cat: '#ff7f50',
  dog: '#ffd700',
  car: '#4ade80',
  bus: '#60a5fa',
  happy: '#ff7f50',
  good: '#ffd700',
  sad: '#4ade80',
  bad: '#60a5fa'
}

// ============ MAIN COMPONENT ============

export default function SimilarityVisualization({
  currentTab,
  selectedPreset,
  setSelectedPreset,
  is3DView,
  setIs3DView,
  magnitudeScale,
  setMagnitudeScale,
  selectedPair,
  setSelectedPair
}) {
  const preset = PRESET_EXAMPLES[selectedPreset]
  const vectors = is3DView ? preset.vectors3D : preset.vectors
  const wordList = Object.keys(vectors)

  // ============ TAB 0: WHY SIMILARITY MATTERS ============
  if (currentTab === 0) {
    return (
      <div className="step-section animate-slide-in">
        <h3 className="section-title">Why Similarity Matters in NLP</h3>

        <div className="intro-content">
          <div className="problem-statement">
            <p className="lead-text">
              In NLP, words are represented as <strong>vectors</strong> (embeddings).
              But how do we measure if two words are <em>semantically similar</em>?
            </p>
          </div>

          <div className="example-cards">
            <div className="example-card similar">
              <div className="word-pair">
                <span className="word">"king"</span>
                <span className="relation">should be similar to</span>
                <span className="word">"queen"</span>
              </div>
              <div className="check-mark">Similar</div>
            </div>

            <div className="example-card different">
              <div className="word-pair">
                <span className="word">"king"</span>
                <span className="relation">should be different from</span>
                <span className="word">"banana"</span>
              </div>
              <div className="x-mark">Different</div>
            </div>
          </div>

          <div className="question-box">
            <h4>The Key Question:</h4>
            <p>Given two vectors representing words, <strong>which similarity metric should we use?</strong></p>
            <p className="hint">Spoiler: Cosine similarity is usually the best choice for semantic comparison.</p>
          </div>

          <div className="vector-preview">
            <svg width="300" height="200" className="mini-vector-space">
              <line x1="150" y1="0" x2="150" y2="200" stroke="#3a3a5a" strokeWidth="1" />
              <line x1="0" y1="100" x2="300" y2="100" stroke="#3a3a5a" strokeWidth="1" />

              <line x1="150" y1="100" x2="250" y2="50" stroke="#ff7f50" strokeWidth="3" markerEnd="url(#arrow)" />
              <text x="255" y="45" fill="#ff7f50" fontSize="14">king</text>

              <line x1="150" y1="100" x2="240" y2="60" stroke="#ffd700" strokeWidth="3" markerEnd="url(#arrow)" />
              <text x="245" y="55" fill="#ffd700" fontSize="14">queen</text>

              <text x="150" y="190" fill="#888" fontSize="12" textAnchor="middle">?</text>
              <text x="150" y="180" fill="#888" fontSize="10" textAnchor="middle">How similar?</text>

              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    )
  }

  // ============ TAB 1: SIX METHODS ============
  if (currentTab === 1) {
    return (
      <div className="step-section animate-slide-in">
        <h3 className="section-title">Six Similarity Methods</h3>

        <div className="methods-grid">
          <div className="method-card">
            <div className="method-icon">L2</div>
            <h4>Euclidean Distance</h4>
            <div className="formula">d = sqrt(sum((a - b)^2))</div>
            <p>Straight-line distance in space. Affected by vector magnitude.</p>
          </div>

          <div className="method-card">
            <div className="method-icon">a*b</div>
            <h4>Dot Product</h4>
            <div className="formula">a · b = sum(a[i] * b[i])</div>
            <p>Raw inner product. Mixes magnitude and direction together.</p>
          </div>

          <div className="method-card highlight">
            <div className="method-icon star">cos</div>
            <h4>Cosine Similarity</h4>
            <div className="formula">cos(θ) = (a · b) / (|a| |b|)</div>
            <p><strong>Measures angle only.</strong> Ignores magnitude - perfect for semantics!</p>
          </div>

          <div className="method-card">
            <div className="method-icon">L1</div>
            <h4>Manhattan Distance</h4>
            <div className="formula">d = sum(|a[i] - b[i]|)</div>
            <p>"Taxi cab" distance. Sum of absolute differences.</p>
          </div>

          <div className="method-card">
            <div className="method-icon">J</div>
            <h4>Jaccard Similarity</h4>
            <div className="formula">J = |A ∩ B| / |A ∪ B|</div>
            <p>Set overlap ratio. Best for binary/categorical features.</p>
          </div>

          <div className="method-card">
            <div className="method-icon">r</div>
            <h4>Pearson Correlation</h4>
            <div className="formula">r = cov(a,b) / (σa * σb)</div>
            <p>Centered cosine. Measures linear relationship.</p>
          </div>
        </div>

        <div className="insight-box">
          <p><strong>Key Insight:</strong> For word embeddings, we care about the <em>direction</em> of vectors (semantic meaning), not their <em>length</em> (word frequency). This is why <strong>cosine similarity</strong> is the standard choice.</p>
        </div>
      </div>
    )
  }

  // ============ TAB 2: INTERACTIVE VECTOR SPACE ============
  if (currentTab === 2) {
    const svgSize = 400
    const center = svgSize / 2
    const scale = 150

    // Calculate all metrics for selected pair
    const v1 = vectors[selectedPair[0]]
    const v2 = vectors[selectedPair[1]]

    const metrics = v1 && v2 ? {
      euclidean: euclideanDistance(v1, v2),
      dotProduct: dotProduct(v1, v2),
      cosine: cosineSimilarity(v1, v2),
      manhattan: manhattanDistance(v1, v2),
      pearson: pearsonCorrelation(v1, v2)
    } : null

    // For 3D projection
    const project3D = (vec, rotationAngle = 0.5) => {
      if (vec.length === 2) return vec
      const cos = Math.cos(rotationAngle)
      const sin = Math.sin(rotationAngle)
      const x = vec[0] * cos - vec[2] * sin
      const y = vec[1]
      return [x, y]
    }

    return (
      <div className="step-section animate-slide-in">
        <h3 className="section-title">Interactive Vector Space</h3>

        <div className="controls-row">
          <div className="control-group">
            <label>Preset Example:</label>
            <select
              value={selectedPreset}
              onChange={(e) => {
                setSelectedPreset(e.target.value)
                const newWords = Object.keys(PRESET_EXAMPLES[e.target.value].vectors)
                setSelectedPair([newWords[0], newWords[1]])
              }}
            >
              {Object.entries(PRESET_EXAMPLES).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={`toggle-btn ${!is3DView ? 'active' : ''}`}
              onClick={() => setIs3DView(false)}
            >
              2D View
            </button>
            <button
              className={`toggle-btn ${is3DView ? 'active' : ''}`}
              onClick={() => setIs3DView(true)}
            >
              3D View
            </button>
          </div>
        </div>

        <div className="vector-space-container">
          <svg width={svgSize} height={svgSize} className="vector-space-svg">
            {/* Grid */}
            <line x1={0} y1={center} x2={svgSize} y2={center} stroke="#3a3a5a" strokeWidth="1" />
            <line x1={center} y1={0} x2={center} y2={svgSize} stroke="#3a3a5a" strokeWidth="1" />

            {/* Circle guide */}
            <circle cx={center} cy={center} r={scale} fill="none" stroke="#3a3a5a" strokeWidth="1" strokeDasharray="4,4" />

            {/* Vectors */}
            {Object.entries(vectors).map(([word, vec]) => {
              const projected = is3DView ? project3D(vec) : vec
              const x = center + projected[0] * scale
              const y = center - projected[1] * scale
              const isSelected = selectedPair.includes(word)

              return (
                <g key={word} className="vector-group" onClick={() => {
                  if (selectedPair[0] === word) {
                    // Already first, do nothing
                  } else if (selectedPair[1] === word) {
                    // Swap
                    setSelectedPair([selectedPair[1], selectedPair[0]])
                  } else {
                    // Replace second
                    setSelectedPair([selectedPair[0], word])
                  }
                }}>
                  <line
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke={VECTOR_COLORS[word] || '#888'}
                    strokeWidth={isSelected ? 4 : 2}
                    opacity={isSelected ? 1 : 0.6}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={6}
                    fill={VECTOR_COLORS[word] || '#888'}
                    className="vector-endpoint"
                  />
                  <text
                    x={x + 10}
                    y={y - 10}
                    fill={VECTOR_COLORS[word] || '#888'}
                    fontSize="14"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {word}
                  </text>
                </g>
              )
            })}

            {/* Angle arc for selected pair */}
            {v1 && v2 && (() => {
              const p1 = is3DView ? project3D(v1) : v1
              const p2 = is3DView ? project3D(v2) : v2
              const angle1 = Math.atan2(p1[1], p1[0])
              const angle2 = Math.atan2(p2[1], p2[0])
              const arcRadius = 40

              const startAngle = Math.min(angle1, angle2)
              const endAngle = Math.max(angle1, angle2)
              const angleDiff = (endAngle - startAngle) * 180 / Math.PI

              const x1 = center + arcRadius * Math.cos(startAngle)
              const y1 = center - arcRadius * Math.sin(startAngle)
              const x2 = center + arcRadius * Math.cos(endAngle)
              const y2 = center - arcRadius * Math.sin(endAngle)

              const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

              return (
                <g className="angle-visualization">
                  <path
                    d={`M ${center} ${center} L ${x1} ${y1} A ${arcRadius} ${arcRadius} 0 ${largeArc} 0 ${x2} ${y2} Z`}
                    fill="rgba(255, 127, 80, 0.2)"
                    stroke="#ff7f50"
                    strokeWidth="2"
                  />
                  <text
                    x={center + arcRadius * 1.5 * Math.cos((startAngle + endAngle) / 2)}
                    y={center - arcRadius * 1.5 * Math.sin((startAngle + endAngle) / 2)}
                    fill="#ff7f50"
                    fontSize="12"
                    textAnchor="middle"
                  >
                    {angleDiff.toFixed(1)}°
                  </text>
                </g>
              )
            })()}
          </svg>

          <div className="metrics-panel">
            <h4>Similarity Metrics</h4>
            <div className="pair-selector">
              <select value={selectedPair[0]} onChange={(e) => setSelectedPair([e.target.value, selectedPair[1]])}>
                {wordList.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
              <span className="vs">vs</span>
              <select value={selectedPair[1]} onChange={(e) => setSelectedPair([selectedPair[0], e.target.value])}>
                {wordList.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            {metrics && (
              <div className="metrics-list">
                <div className="metric-row">
                  <span className="metric-name">Euclidean:</span>
                  <span className="metric-value">{metrics.euclidean.toFixed(3)}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-name">Dot Product:</span>
                  <span className="metric-value">{metrics.dotProduct.toFixed(3)}</span>
                </div>
                <div className="metric-row highlight">
                  <span className="metric-name">Cosine:</span>
                  <span className="metric-value">{metrics.cosine.toFixed(3)}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-name">Manhattan:</span>
                  <span className="metric-value">{metrics.manhattan.toFixed(3)}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-name">Pearson:</span>
                  <span className="metric-value">{metrics.pearson.toFixed(3)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="hint-text">Click on vectors to select pairs for comparison</p>
      </div>
    )
  }

  // ============ TAB 3: THE MAGNITUDE PROBLEM ============
  if (currentTab === 3) {
    const svgSize = 350
    const center = svgSize / 2
    const scale = 120

    // Base vectors - king and queen
    const baseKing = [0.8, 0.3]
    const baseQueen = [0.75, 0.35]

    // Scale king by magnitude slider
    const scaledKing = baseKing.map(v => v * magnitudeScale)

    // Calculate metrics
    const metrics = {
      euclidean: euclideanDistance(scaledKing, baseQueen),
      dotProduct: dotProduct(scaledKing, baseQueen),
      cosine: cosineSimilarity(scaledKing, baseQueen),
      manhattan: manhattanDistance(scaledKing, baseQueen)
    }

    // Base metrics (for comparison)
    const baseMetrics = {
      euclidean: euclideanDistance(baseKing, baseQueen),
      dotProduct: dotProduct(baseKing, baseQueen),
      cosine: cosineSimilarity(baseKing, baseQueen),
      manhattan: manhattanDistance(baseKing, baseQueen)
    }

    return (
      <div className="step-section animate-slide-in">
        <h3 className="section-title">The Magnitude Problem</h3>

        <div className="magnitude-explanation">
          <p className="lead-text">
            Imagine "king" appears <strong>{magnitudeScale.toFixed(1)}x</strong> more frequently in our training corpus.
            Its embedding vector gets <strong>scaled up</strong>, but its <em>meaning</em> stays the same!
          </p>
        </div>

        <div className="magnitude-demo-container">
          <div className="slider-container">
            <label>Vector Magnitude: <strong>{magnitudeScale.toFixed(1)}x</strong></label>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={magnitudeScale}
              onChange={(e) => setMagnitudeScale(parseFloat(e.target.value))}
              className="magnitude-slider"
            />
            <div className="slider-labels">
              <span>0.2x</span>
              <span>1x</span>
              <span>2x</span>
              <span>3x</span>
            </div>
          </div>

          <div className="magnitude-visual">
            <svg width={svgSize} height={svgSize} className="magnitude-svg">
              <line x1={0} y1={center} x2={svgSize} y2={center} stroke="#3a3a5a" strokeWidth="1" />
              <line x1={center} y1={0} x2={center} y2={svgSize} stroke="#3a3a5a" strokeWidth="1" />

              {/* Original king (faded) */}
              <line
                x1={center}
                y1={center}
                x2={center + baseKing[0] * scale}
                y2={center - baseKing[1] * scale}
                stroke="#ff7f50"
                strokeWidth="2"
                strokeDasharray="4,4"
                opacity="0.4"
              />

              {/* Scaled king */}
              <line
                x1={center}
                y1={center}
                x2={center + scaledKing[0] * scale}
                y2={center - scaledKing[1] * scale}
                stroke="#ff7f50"
                strokeWidth="3"
              />
              <circle
                cx={center + scaledKing[0] * scale}
                cy={center - scaledKing[1] * scale}
                r={6}
                fill="#ff7f50"
              />
              <text
                x={center + scaledKing[0] * scale + 10}
                y={center - scaledKing[1] * scale - 10}
                fill="#ff7f50"
                fontSize="14"
                fontWeight="bold"
              >
                king ({magnitudeScale.toFixed(1)}x)
              </text>

              {/* Queen (constant) */}
              <line
                x1={center}
                y1={center}
                x2={center + baseQueen[0] * scale}
                y2={center - baseQueen[1] * scale}
                stroke="#ffd700"
                strokeWidth="3"
              />
              <circle
                cx={center + baseQueen[0] * scale}
                cy={center - baseQueen[1] * scale}
                r={6}
                fill="#ffd700"
              />
              <text
                x={center + baseQueen[0] * scale + 10}
                y={center - baseQueen[1] * scale + 15}
                fill="#ffd700"
                fontSize="14"
              >
                queen
              </text>
            </svg>
          </div>

          <div className="metrics-comparison">
            <h4>How Metrics Change</h4>
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                <tr className={Math.abs(metrics.euclidean - baseMetrics.euclidean) > 0.01 ? 'changing' : ''}>
                  <td>Euclidean</td>
                  <td>{metrics.euclidean.toFixed(3)}</td>
                  <td className="change-indicator">
                    {metrics.euclidean > baseMetrics.euclidean ? '↑' : metrics.euclidean < baseMetrics.euclidean ? '↓' : '—'}
                  </td>
                </tr>
                <tr className={Math.abs(metrics.dotProduct - baseMetrics.dotProduct) > 0.01 ? 'changing' : ''}>
                  <td>Dot Product</td>
                  <td>{metrics.dotProduct.toFixed(3)}</td>
                  <td className="change-indicator">
                    {metrics.dotProduct > baseMetrics.dotProduct ? '↑' : metrics.dotProduct < baseMetrics.dotProduct ? '↓' : '—'}
                  </td>
                </tr>
                <tr className="stable highlight">
                  <td>Cosine</td>
                  <td>{metrics.cosine.toFixed(3)}</td>
                  <td className="change-indicator stable">—</td>
                </tr>
                <tr className={Math.abs(metrics.manhattan - baseMetrics.manhattan) > 0.01 ? 'changing' : ''}>
                  <td>Manhattan</td>
                  <td>{metrics.manhattan.toFixed(3)}</td>
                  <td className="change-indicator">
                    {metrics.manhattan > baseMetrics.manhattan ? '↑' : metrics.manhattan < baseMetrics.manhattan ? '↓' : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="insight-box success">
          <p><strong>The "Aha!" Moment:</strong> Notice how <strong>Cosine Similarity stays constant</strong> while you drag the slider! It measures the <em>angle</em> between vectors, not their lengths. This is exactly what we want for semantic similarity!</p>
        </div>
      </div>
    )
  }

  // ============ TAB 4: WHY COSINE WINS ============
  if (currentTab === 4) {
    // Calculate all pairwise similarities
    const words = Object.keys(vectors)
    const pairs = []
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        pairs.push([words[i], words[j]])
      }
    }

    const pairMetrics = pairs.map(([w1, w2]) => {
      const v1 = vectors[w1]
      const v2 = vectors[w2]
      return {
        pair: `${w1} - ${w2}`,
        euclidean: euclideanDistance(v1, v2),
        dotProduct: dotProduct(v1, v2),
        cosine: cosineSimilarity(v1, v2),
        manhattan: manhattanDistance(v1, v2),
        pearson: pearsonCorrelation(v1, v2)
      }
    })

    // Sort by cosine to show ranking
    const sortedByCosine = [...pairMetrics].sort((a, b) => b.cosine - a.cosine)

    return (
      <div className="step-section animate-slide-in">
        <h3 className="section-title">Why Cosine is Best for Semantics</h3>

        <div className="preset-selector">
          <label>Example Set:</label>
          <select value={selectedPreset} onChange={(e) => setSelectedPreset(e.target.value)}>
            {Object.entries(PRESET_EXAMPLES).map(([key, val]) => (
              <option key={key} value={key}>{val.name}</option>
            ))}
          </select>
        </div>

        <div className="comparison-table-container">
          <h4>All Pair Comparisons (Sorted by Cosine)</h4>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Word Pair</th>
                <th>Euclidean ↓</th>
                <th>Dot Product</th>
                <th className="highlight-col">Cosine</th>
                <th>Manhattan ↓</th>
                <th>Pearson</th>
              </tr>
            </thead>
            <tbody>
              {sortedByCosine.map((row, idx) => (
                <tr key={row.pair}>
                  <td className="pair-name">{row.pair}</td>
                  <td>{row.euclidean.toFixed(3)}</td>
                  <td>{row.dotProduct.toFixed(3)}</td>
                  <td className="highlight-col">{row.cosine.toFixed(3)}</td>
                  <td>{row.manhattan.toFixed(3)}</td>
                  <td>{row.pearson.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="table-note">↓ = Lower is more similar (distance metrics)</p>
        </div>

        <div className="properties-grid">
          <div className="property-card success">
            <h4>Cosine Advantages</h4>
            <ul>
              <li><strong>Magnitude invariant</strong> - Word frequency doesn't distort similarity</li>
              <li><strong>Bounded range</strong> - Always between -1 and 1</li>
              <li><strong>Geometric intuition</strong> - Measures the angle between vectors</li>
              <li><strong>Works in high dimensions</strong> - Scales well to 512+ dim embeddings</li>
            </ul>
          </div>

          <div className="property-card warning">
            <h4>When Others Are Better</h4>
            <ul>
              <li><strong>Euclidean</strong> - Clustering when absolute position matters</li>
              <li><strong>Dot Product</strong> - Attention mechanisms (before normalization)</li>
              <li><strong>Jaccard</strong> - Binary features, text overlap</li>
              <li><strong>Manhattan</strong> - Sparse vectors, some ML optimizations</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // ============ TAB 5: SUMMARY ============
  if (currentTab === 5) {
    return (
      <div className="step-section animate-slide-in">
        <h3 className="section-title">Applications & Summary</h3>

        <div className="summary-grid">
          <div className="summary-card euclidean">
            <div className="method-header">
              <span className="method-icon">L2</span>
              <h4>Euclidean Distance</h4>
            </div>
            <p className="use-case"><strong>Best for:</strong> Clustering, k-NN when absolute positions matter</p>
            <p className="limitation"><strong>Limitation:</strong> Affected by magnitude</p>
          </div>

          <div className="summary-card dot-product">
            <div className="method-header">
              <span className="method-icon">a·b</span>
              <h4>Dot Product</h4>
            </div>
            <p className="use-case"><strong>Best for:</strong> Attention mechanisms, scaled scoring</p>
            <p className="limitation"><strong>Limitation:</strong> Unbounded, mixes magnitude and direction</p>
          </div>

          <div className="summary-card cosine highlight">
            <div className="method-header">
              <span className="method-icon star">cos</span>
              <h4>Cosine Similarity</h4>
            </div>
            <p className="use-case"><strong>Best for:</strong> Word embeddings, semantic search, recommendations</p>
            <p className="strength"><strong>Strength:</strong> Magnitude invariant - the gold standard for NLP!</p>
          </div>

          <div className="summary-card manhattan">
            <div className="method-header">
              <span className="method-icon">L1</span>
              <h4>Manhattan Distance</h4>
            </div>
            <p className="use-case"><strong>Best for:</strong> Sparse vectors, some optimization problems</p>
            <p className="limitation"><strong>Limitation:</strong> Less intuitive geometrically</p>
          </div>

          <div className="summary-card jaccard">
            <div className="method-header">
              <span className="method-icon">J</span>
              <h4>Jaccard Similarity</h4>
            </div>
            <p className="use-case"><strong>Best for:</strong> Set overlap, plagiarism detection, document similarity</p>
            <p className="limitation"><strong>Limitation:</strong> Only works on binary/set features</p>
          </div>

          <div className="summary-card pearson">
            <div className="method-header">
              <span className="method-icon">r</span>
              <h4>Pearson Correlation</h4>
            </div>
            <p className="use-case"><strong>Best for:</strong> When data needs centering, correlation analysis</p>
            <p className="limitation"><strong>Limitation:</strong> Assumes linear relationships</p>
          </div>
        </div>

        <div className="final-takeaway">
          <h4>Key Takeaway</h4>
          <p>
            For <strong>semantic similarity in NLP</strong> (word embeddings, sentence embeddings, document similarity),
            <strong> cosine similarity is the default choice</strong> because it measures what we actually care about:
            the <em>direction</em> of meaning, not the <em>magnitude</em> of word frequency.
          </p>
        </div>

        <div className="formula-recap">
          <div className="formula-box">
            <span className="formula-label">The Winner:</span>
            <div className="formula-content">
              cos(θ) = <span className="frac"><span className="num">a · b</span><span className="denom">|a| × |b|</span></span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
