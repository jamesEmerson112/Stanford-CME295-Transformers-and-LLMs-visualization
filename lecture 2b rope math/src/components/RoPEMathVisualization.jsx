import React, { useState, useEffect } from 'react'

// Convert degrees to radians
const toRadians = (deg) => (deg * Math.PI) / 180

export default function RoPEMathVisualization({ currentTab }) {
  const [animationStep, setAnimationStep] = useState(0)
  const [selectedDimPair, setSelectedDimPair] = useState(0)

  // Reset animation when tab changes
  useEffect(() => {
    setAnimationStep(0)
    if (currentTab === 2) {
      // Animate derivation steps
      const timers = []
      for (let i = 1; i <= 5; i++) {
        timers.push(setTimeout(() => setAnimationStep(i), i * 1200))
      }
      return () => timers.forEach(t => clearTimeout(t))
    }
  }, [currentTab])

  // Tab 0: Why 2D Pairs
  if (currentTab === 0) {
    return (
      <div className="math-content">
        <div className="content-card">
          <h3>High-Dimensional Embeddings Use Paired 2D Rotations</h3>

          <div className="explanation-block">
            <p>In transformers, embeddings have many dimensions (e.g., d = 512 or 4096).</p>
            <p>RoPE handles this by splitting the embedding into <strong>pairs</strong> and applying a 2D rotation to each pair independently.</p>
          </div>

          <div className="visual-diagram">
            <div className="dimension-split">
              <div className="original-embedding">
                <div className="label">Original Embedding (d = 8)</div>
                <div className="dimension-row">
                  {[0,1,2,3,4,5,6,7].map(i => (
                    <div key={i} className="dim-box">x<sub>{i}</sub></div>
                  ))}
                </div>
              </div>

              <div className="arrow-down">Split into pairs</div>

              <div className="paired-embeddings">
                {[0,1,2,3].map(pair => (
                  <div key={pair} className={`pair-group ${selectedDimPair === pair ? 'selected' : ''}`}
                       onClick={() => setSelectedDimPair(pair)}>
                    <div className="pair-label">Pair {pair}</div>
                    <div className="pair-dims">
                      <div className="dim-box highlight">x<sub>{pair*2}</sub></div>
                      <div className="dim-box highlight">x<sub>{pair*2+1}</sub></div>
                    </div>
                    <div className="rotation-label">R(θ<sub>{pair}</sub>)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="why-not-3d">
            <h4>Why Not 3D (or Higher) Rotations?</h4>
            <div className="comparison-grid">
              <div className="comparison-item good">
                <div className="icon">2D</div>
                <ul>
                  <li>Simple: Only 1 angle needed</li>
                  <li>Commutative: R(a) R(b) = R(b) R(a)</li>
                  <li>Key property: R(a)<sup>T</sup> R(b) = R(b-a)</li>
                  <li>Efficient: Element-wise operations</li>
                </ul>
              </div>
              <div className="comparison-item bad">
                <div className="icon">3D+</div>
                <ul>
                  <li>Complex: 3 angles (Euler/quaternions)</li>
                  <li>Non-commutative: Order matters!</li>
                  <li>Loses the simple subtraction property</li>
                  <li>More computation, no benefit</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tab 1: Multi-Frequency
  if (currentTab === 1) {
    const numPairs = 4
    const baseFreq = 10000
    const dModel = 512

    // Calculate frequencies for each pair
    const frequencies = Array.from({length: numPairs}, (_, i) => {
      const theta = 1 / Math.pow(baseFreq, (2 * i) / dModel)
      return theta
    })

    return (
      <div className="math-content">
        <div className="content-card">
          <h3>Different Dimension Pairs Rotate at Different Speeds</h3>

          <div className="explanation-block">
            <p>Each dimension pair uses a different rotation frequency:</p>
            <div className="formula-box">
              θ<sub>i</sub> = 10000<sup>-2i/d</sup>
            </div>
            <p>This creates a spectrum from slow (long-range patterns) to fast (local patterns).</p>
          </div>

          <div className="frequency-visual">
            <div className="circles-row">
              {frequencies.map((freq, i) => {
                const position = 3 // example position
                const angle = position * freq * 360 * 10 // scaled for visibility
                return (
                  <div key={i} className="frequency-circle">
                    <div className="circle-label">Pair {i}</div>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#3a3a5a" strokeWidth="2" />
                      <line
                        x1="60" y1="60"
                        x2={60 + 45 * Math.cos(toRadians(angle - 90))}
                        y2={60 + 45 * Math.sin(toRadians(angle - 90))}
                        stroke={`hsl(${30 + i * 60}, 70%, 60%)`}
                        strokeWidth="3"
                      />
                      <circle cx="60" cy="60" r="4" fill={`hsl(${30 + i * 60}, 70%, 60%)`} />
                    </svg>
                    <div className="freq-value">θ = {(freq * 1000).toFixed(4)}</div>
                    <div className="freq-desc">
                      {i === 0 ? 'Slowest' : i === numPairs - 1 ? 'Fastest' : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="frequency-insight">
            <h4>Why Multiple Frequencies?</h4>
            <div className="insight-grid">
              <div className="insight-item">
                <div className="insight-icon slow"></div>
                <div className="insight-text">
                  <strong>Slow rotations (low i)</strong>
                  <p>Change slowly with position changes long-range dependencies</p>
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-icon fast"></div>
                <div className="insight-text">
                  <strong>Fast rotations (high i)</strong>
                  <p>Change quickly can distinguish nearby positions</p>
                </div>
              </div>
            </div>
            <p className="analogy">
              <strong>Analogy:</strong> Like a clock with hour, minute, and second hands,
              different frequencies let us encode both coarse and fine position information.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Tab 2: Derivation
  if (currentTab === 2) {
    const steps = [
      {
        formula: 'q̃ₘ = R(m·θ) · qₘ',
        desc: 'Rotate query by position m'
      },
      {
        formula: 'k̃ₙ = R(n·θ) · kₙ',
        desc: 'Rotate key by position n'
      },
      {
        formula: 'q̃ₘ · k̃ₙᵀ = [R(m·θ) · qₘ] · [R(n·θ) · kₙ]ᵀ',
        desc: 'Compute attention dot product'
      },
      {
        formula: '= qₘ · R(m·θ)ᵀ · R(n·θ) · kₙᵀ',
        desc: 'Expand using (AB)ᵀ = BᵀAᵀ'
      },
      {
        formula: '= qₘ · R((n-m)·θ) · kₙᵀ',
        desc: 'KEY: R(a)ᵀ R(b) = R(b-a) for rotations!',
        highlight: true
      }
    ]

    return (
      <div className="math-content">
        <div className="content-card">
          <h3>Proof: Only Relative Position Matters</h3>

          <div className="explanation-block">
            <p>The key insight of RoPE: when computing attention, absolute positions cancel out, leaving only the <strong>relative position (n - m)</strong>.</p>
          </div>

          <div className="derivation-container">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`derivation-step ${animationStep > i ? 'visible' : ''} ${step.highlight ? 'final' : ''}`}
              >
                <span className="step-num">{i + 1}</span>
                <span className="step-formula">{step.formula}</span>
                <span className="step-desc">{step.desc}</span>
              </div>
            ))}
          </div>

          {animationStep >= 5 && (
            <div className="key-result">
              <div className="result-label">Final Result</div>
              <div className="result-formula">
                qₘkₙᵀ = xₘWq R<sub>θ,<span className="highlight">n-m</span></sub> Wkᵀxₙᵀ
              </div>
              <div className="result-insight">
                The rotation matrix only depends on <span className="highlight">(n - m)</span> = relative position!
              </div>
            </div>
          )}

          <div className="math-key">
            <h4>The Magic Property</h4>
            <div className="property-box">
              <div className="property-formula">
                R(a)ᵀ · R(b) = R(b - a)
              </div>
              <p>For orthogonal rotation matrices, the transpose of a rotation combined with another rotation gives their angle <em>difference</em>.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tab 3: Benefits
  if (currentTab === 3) {
    return (
      <div className="math-content">
        <div className="content-card">
          <h3>Why RoPE is Powerful</h3>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">1</div>
              <h4>Relative Position Naturally</h4>
              <p>Attention between tokens depends only on their distance (n-m), not where they are in the sequence. "cat sat" has the same relationship at position 0 or position 1000.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">2</div>
              <h4>No Learned Embeddings</h4>
              <p>Unlike absolute position embeddings, RoPE doesn't need learned position vectors. The rotation is deterministic and parameter-free.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">3</div>
              <h4>Length Generalization</h4>
              <p>Models can handle sequences longer than seen during training. The rotation formula works for any position without needing new parameters.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">4</div>
              <h4>Translation Invariance</h4>
              <p>Shifting the entire sequence doesn't change attention patterns. Token relationships stay the same regardless of absolute position.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">5</div>
              <h4>Efficient Computation</h4>
              <p>2D rotations are cheap: just 4 multiplications and 2 additions per pair. Can be done element-wise without matrix operations.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">6</div>
              <h4>Multi-Scale Encoding</h4>
              <p>Different frequency pairs capture both local (nearby tokens) and global (distant relationships) position information.</p>
            </div>
          </div>

          <div className="usage-note">
            <h4>Used In</h4>
            <div className="model-tags">
              <span className="model-tag">LLaMA</span>
              <span className="model-tag">Mistral</span>
              <span className="model-tag">Falcon</span>
              <span className="model-tag">GPT-NeoX</span>
              <span className="model-tag">PaLM</span>
              <span className="model-tag">CodeLlama</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
