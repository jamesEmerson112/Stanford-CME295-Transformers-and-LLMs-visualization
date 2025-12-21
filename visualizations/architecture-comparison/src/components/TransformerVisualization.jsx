import React from 'react'

function TransformerVisualization({ tokens, currentStep }) {
  // Simulated attention weights for the new phrase
  const getAttentionWeight = (fromIdx, toIdx) => {
    const fromToken = tokens[fromIdx]?.toLowerCase()
    const toToken = tokens[toIdx]?.toLowerCase()

    // Self-attention is always high
    if (fromIdx === toIdx) return 0.8

    // "youth" attends to "popular" and "67"
    if (fromToken === 'youth' && toToken === 'popular') return 0.85
    if (fromToken === 'youth' && toToken === '67') return 0.7
    if (fromToken === 'youth' && toToken === 'number') return 0.5

    // "popular" attends to subject
    if (fromToken === 'popular' && toToken === '67') return 0.75
    if (fromToken === 'popular' && toToken === 'number') return 0.6

    // "becomes" links subject to predicate
    if (fromToken === 'becomes' && toToken === '67') return 0.65
    if (fromToken === 'becomes' && toToken === 'popular') return 0.6

    // "suddenly" is an adverb modifying "becomes"
    if (fromToken === 'suddenly' && toToken === 'becomes') return 0.7

    // Default low attention
    return 0.1 + Math.random() * 0.15
  }

  const activeTokens = Math.min(currentStep, tokens.length)

  // Find strongest attention pairs for highlighting
  const getStrongPairs = () => {
    const pairs = []
    if (activeTokens >= 5) {
      pairs.push({ from: 'popular', to: '67' })
    }
    if (activeTokens >= 8) {
      pairs.push({ from: 'youth', to: 'popular' })
    }
    return pairs
  }

  const strongPairs = getStrongPairs()

  const isHighlightPair = (fromIdx, toIdx) => {
    const fromToken = tokens[fromIdx]?.toLowerCase()
    const toToken = tokens[toIdx]?.toLowerCase()
    return strongPairs.some(p =>
      (p.from === fromToken && p.to === toToken) ||
      (p.from === toToken && p.to === fromToken)
    )
  }

  return (
    <div className="viz-content">
      {/* Positional encoding note */}
      <div style={{
        padding: '6px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '6px',
        marginBottom: '10px',
        fontSize: '0.7rem',
        color: '#888',
        textAlign: 'center'
      }}>
        Position encoded: each token knows its place in sequence
      </div>

      {/* Tokens row with position indicators */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '3px',
        marginBottom: '10px'
      }}>
        {tokens.map((token, idx) => (
          <div key={idx} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.55rem', color: '#555', marginBottom: '2px' }}>
              {idx}
            </div>
            <div
              className={`token ${idx < activeTokens ? 'processed' : 'pending'}`}
              style={{ fontSize: '0.7rem', padding: '3px 5px' }}
            >
              {token}
            </div>
          </div>
        ))}
      </div>

      {/* Attention matrix */}
      {currentStep > 0 && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: '#aaa', marginBottom: '5px', textAlign: 'center' }}>
            Self-Attention Matrix (Q·K<sup>T</sup>/√d)
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(activeTokens, 8)}, 1fr)`,
            gap: '2px',
            maxWidth: '200px',
            margin: '0 auto'
          }}>
            {tokens.slice(0, Math.min(activeTokens, 8)).map((_, fromIdx) => (
              tokens.slice(0, Math.min(activeTokens, 8)).map((_, toIdx) => {
                const weight = getAttentionWeight(fromIdx, toIdx)
                const isHighlight = isHighlightPair(fromIdx, toIdx)

                return (
                  <div
                    key={`${fromIdx}-${toIdx}`}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '2px',
                      background: isHighlight
                        ? `rgba(0, 212, 255, ${weight})`
                        : `rgba(123, 44, 191, ${weight * 0.8})`,
                      border: isHighlight ? '1px solid #00d4ff' : 'none',
                      transition: 'all 0.3s'
                    }}
                    title={`${tokens[fromIdx]} → ${tokens[toIdx]}: ${(weight * 100).toFixed(0)}%`}
                  />
                )
              })
            ))}
          </div>
        </div>
      )}

      {/* Key insight */}
      {activeTokens >= 5 && (
        <div style={{
          marginTop: '12px',
          padding: '8px',
          background: 'rgba(0, 212, 255, 0.15)',
          border: '1px solid rgba(0, 212, 255, 0.4)',
          borderRadius: '6px',
          fontSize: '0.7rem',
          color: '#00d4ff',
          textAlign: 'center'
        }}>
          ✓ "popular" directly attends to "67" - parallel connections!
        </div>
      )}

      {/* Multi-head note */}
      <div style={{
        marginTop: '8px',
        fontSize: '0.65rem',
        color: '#666',
        textAlign: 'center'
      }}>
        {currentStep === 0 && "All tokens processed simultaneously"}
        {currentStep > 0 && "Multiple attention heads capture different patterns"}
      </div>
    </div>
  )
}

export default TransformerVisualization
