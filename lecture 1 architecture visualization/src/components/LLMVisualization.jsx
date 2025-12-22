import React from 'react'

function LLMVisualization({ tokens, currentStep }) {
  const numLayers = 6
  // Scale layer activation to complete all layers by the final step
  const activeLayer = Math.min(
    Math.ceil((currentStep / tokens.length) * numLayers),
    numLayers
  )

  // Simulated attention for current layer
  const getAttentionWeight = (fromIdx, toIdx) => {
    const fromToken = tokens[fromIdx]?.toLowerCase()
    const toToken = tokens[toIdx]?.toLowerCase()
    if (fromIdx === toIdx) return 0.7
    // "youth" attends to "popular" and "67"
    if (fromToken === 'youth' && toToken === 'popular') return 0.8
    if (fromToken === 'youth' && toToken === '67') return 0.75
    if (fromToken === 'popular' && toToken === '67') return 0.7
    if (fromToken === 'popular' && toToken === 'number') return 0.6
    return 0.1 + Math.random() * 0.2
  }

  // Simulated next-token prediction with top candidates
  const getPredictions = () => {
    if (currentStep < tokens.length) return null

    const lastTokens = tokens.slice(-3).join(' ').toLowerCase()

    if (lastTokens.includes('the youth')) {
      return [
        { token: '.', probability: 0.42 },
        { token: 'today', probability: 0.25 },
        { token: 'of', probability: 0.18 },
        { token: 'in', probability: 0.08 }
      ]
    }
    if (lastTokens.includes('among the')) {
      return [
        { token: 'youth', probability: 0.65 },
        { token: 'young', probability: 0.15 },
        { token: 'teenagers', probability: 0.12 },
        { token: 'students', probability: 0.05 }
      ]
    }

    return [
      { token: '.', probability: 0.45 },
      { token: ',', probability: 0.25 },
      { token: 'and', probability: 0.15 },
      { token: 'in', probability: 0.08 }
    ]
  }

  const predictions = getPredictions()
  const activeTokens = Math.min(currentStep, tokens.length)

  return (
    <div className="viz-content">
      {/* Horizontal layout for full-width panel */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        width: '100%',
        gap: '30px',
        flexWrap: 'wrap'
      }}>

        {/* Left: Input tokens + Embedding */}
        <div style={{ flex: '1', minWidth: '250px', maxWidth: '400px' }}>
          <div style={{ fontSize: '0.85rem', color: '#00d4ff', marginBottom: '10px', fontWeight: 'bold' }}>
            1. Input & Tokenization
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            padding: '10px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            marginBottom: '10px'
          }}>
            {tokens.map((token, idx) => (
              <div
                key={idx}
                className={`token ${idx < activeTokens ? 'processed' : 'pending'}`}
                style={{ fontSize: '0.85rem', padding: '6px 10px' }}
              >
                {token}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#888', textAlign: 'center' }}>
            Each token → embedding vector + positional encoding
          </div>
        </div>

        {/* Center: Transformer layers stack */}
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '450px' }}>
          <div style={{ fontSize: '0.85rem', color: '#00d4ff', marginBottom: '10px', fontWeight: 'bold' }}>
            2. Transformer Layers (×{numLayers})
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {[...Array(numLayers)].map((_, layerIdx) => {
              const isActive = layerIdx < activeLayer
              const isCurrent = layerIdx === activeLayer - 1

              return (
                <div
                  key={layerIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(0, 212, 255, 0.3), rgba(123, 44, 191, 0.3))'
                      : 'rgba(60, 60, 80, 0.4)',
                    borderRadius: '6px',
                    border: isCurrent ? '2px solid #00d4ff' : '1px solid transparent',
                    transition: 'all 0.3s',
                    opacity: isActive ? 1 : 0.4
                  }}
                >
                  <span style={{ fontWeight: 'bold', color: isActive ? '#00d4ff' : '#666', minWidth: '70px' }}>
                    Layer {layerIdx + 1}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: isActive ? '#aaa' : '#555' }}>
                    Self-Attention → Add & Norm → FFN → Add & Norm
                  </span>
                  {isActive && <span style={{ marginLeft: 'auto', color: '#2d8f6f' }}>✓</span>}
                </div>
              )
            })}
          </div>

          {/* Mini attention matrix */}
          {activeLayer > 0 && (
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '5px' }}>
                Attention Pattern (Layer {activeLayer})
              </div>
              <div style={{
                display: 'inline-grid',
                gridTemplateColumns: `repeat(${Math.min(6, activeTokens)}, 18px)`,
                gap: '2px'
              }}>
                {tokens.slice(0, Math.min(6, activeTokens)).map((_, fromIdx) => (
                  tokens.slice(0, Math.min(6, activeTokens)).map((_, toIdx) => {
                    const weight = getAttentionWeight(fromIdx, toIdx)
                    const fromToken = tokens[fromIdx]?.toLowerCase()
                    const toToken = tokens[toIdx]?.toLowerCase()
                    // Highlight key semantic relationships in the phrase
                    const isHighlight = (
                      (fromToken === 'youth' && toToken === 'popular') ||
                      (fromToken === 'youth' && toToken === '67') ||
                      (fromToken === 'popular' && toToken === '67') ||
                      (fromToken === 'popular' && toToken === 'number') ||
                      (fromToken === 'becomes' && toToken === 'popular')
                    )
                    return (
                      <div
                        key={`${fromIdx}-${toIdx}`}
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '2px',
                          background: isHighlight
                            ? `rgba(0, 212, 255, ${weight})`
                            : `rgba(123, 44, 191, ${weight * 0.8})`,
                          border: isHighlight ? '1px solid #00d4ff' : 'none'
                        }}
                      />
                    )
                  })
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Output / Prediction */}
        <div style={{ flex: '1', minWidth: '200px', maxWidth: '300px' }}>
          <div style={{ fontSize: '0.85rem', color: '#00d4ff', marginBottom: '10px', fontWeight: 'bold' }}>
            3. Output & Prediction
          </div>

          {currentStep >= tokens.length && predictions ? (
            <div style={{
              padding: '15px',
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '10px' }}>
                Top predictions for next token:
              </div>
              {predictions.map((pred, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '6px'
                  }}
                >
                  <div style={{
                    flex: 1,
                    height: '20px',
                    background: 'rgba(60, 60, 80, 0.5)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${pred.probability * 100}%`,
                      height: '100%',
                      background: idx === 0
                        ? 'linear-gradient(90deg, #00d4ff, #7b2cbf)'
                        : 'rgba(123, 44, 191, 0.5)',
                      borderRadius: '4px',
                      transition: 'width 0.5s'
                    }} />
                  </div>
                  <span style={{
                    minWidth: '60px',
                    fontSize: '0.85rem',
                    color: idx === 0 ? '#00d4ff' : '#888',
                    fontWeight: idx === 0 ? 'bold' : 'normal'
                  }}>
                    "{pred.token}"
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#666', minWidth: '35px' }}>
                    {(pred.probability * 100).toFixed(0)}%
                  </span>
                </div>
              ))}

              <div style={{
                marginTop: '12px',
                padding: '8px',
                background: 'rgba(45, 143, 111, 0.2)',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#2d8f6f',
                textAlign: 'center'
              }}>
                Selected: "{predictions[0].token}" → append to sequence → repeat
              </div>
            </div>
          ) : (
            <div style={{
              padding: '20px',
              background: 'rgba(60, 60, 80, 0.3)',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#666'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
              <div style={{ fontSize: '0.8rem' }}>
                Processing {activeTokens}/{tokens.length} tokens...
              </div>
              <div style={{ fontSize: '0.7rem', marginTop: '5px', color: '#555' }}>
                Layer {activeLayer}/{numLayers}
              </div>
            </div>
          )}

          {/* Autoregressive note */}
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(123, 44, 191, 0.15)',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#aaa'
          }}>
            <strong>Autoregressive:</strong> LLMs generate one token at a time, each prediction becomes input for the next.
          </div>
        </div>
      </div>
    </div>
  )
}

export default LLMVisualization
