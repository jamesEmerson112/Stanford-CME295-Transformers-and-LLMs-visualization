import React from 'react'

function Word2VecVisualization({ tokens, currentStep }) {
  // Simulated embedding vectors (deterministic based on token)
  const getEmbeddingPattern = (token) => {
    const hash = token.toLowerCase().split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return [...Array(8)].map((_, i) => ((hash * (i + 1) * 7) % 100) / 100)
  }

  // Simulated 2D projection coordinates for visualization
  const get2DPosition = (token) => {
    const hash = token.toLowerCase().split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return {
      x: ((hash * 13) % 100) / 100,
      y: ((hash * 17) % 100) / 100
    }
  }

  // Get semantic groups for coloring
  const getSemanticGroup = (token) => {
    const word = token.toLowerCase()
    if (['number', '67', 'popular'].includes(word)) return '#e74c3c' // topic words
    if (['suddenly', 'becomes'].includes(word)) return '#3498db' // verbs/adverbs
    if (['among', 'the'].includes(word)) return '#888' // function words
    if (['youth'].includes(word)) return '#27ae60' // people
    return '#7b2cbf'
  }

  const activeTokens = tokens.slice(0, currentStep)

  return (
    <div className="viz-content">
      {/* Training context explanation */}
      <div style={{
        padding: '8px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '6px',
        marginBottom: '10px',
        fontSize: '0.7rem',
        color: '#888',
        textAlign: 'center'
      }}>
        Pre-trained on large corpus: "king - man + woman ≈ queen"
      </div>

      {/* Token list with embedding vectors */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '6px',
        marginBottom: '15px'
      }}>
        {tokens.map((token, idx) => {
          const embedding = getEmbeddingPattern(token)
          const isActive = idx < currentStep
          const color = getSemanticGroup(token)

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: isActive ? 1 : 0.3,
              transition: 'opacity 0.3s'
            }}>
              <div
                className={`token ${isActive ? 'processed' : 'pending'}`}
                style={{
                  fontSize: '0.7rem',
                  padding: '3px 5px',
                  marginBottom: '4px',
                  borderLeft: `3px solid ${color}`
                }}
              >
                {token}
              </div>
              {/* Mini embedding bars */}
              <div style={{ display: 'flex', gap: '1px' }}>
                {embedding.slice(0, 4).map((val, i) => (
                  <div
                    key={i}
                    style={{
                      width: '4px',
                      height: `${8 + val * 15}px`,
                      background: isActive ? color : '#555',
                      borderRadius: '1px',
                      opacity: 0.7
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* 2D Embedding Space Visualization */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '120px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        marginBottom: '10px',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '5px',
          left: '5px',
          fontSize: '0.65rem',
          color: '#666'
        }}>
          2D Embedding Space (t-SNE projection)
        </div>

        {/* Axis lines */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '20px',
          bottom: '10px',
          width: '1px',
          background: 'rgba(255,255,255,0.1)'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '10px',
          right: '10px',
          height: '1px',
          background: 'rgba(255,255,255,0.1)'
        }} />

        {/* Plot tokens */}
        {activeTokens.map((token, idx) => {
          const pos = get2DPosition(token)
          const color = getSemanticGroup(token)

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: `${10 + pos.x * 80}%`,
                top: `${20 + pos.y * 70}%`,
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.5s ease-out'
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 6px ${color}`
              }} />
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.55rem',
                color: '#aaa',
                whiteSpace: 'nowrap'
              }}>
                {token}
              </div>
            </div>
          )
        })}
      </div>

      {/* Key characteristics */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{
          padding: '6px 10px',
          background: 'rgba(39, 174, 96, 0.2)',
          border: '1px solid rgba(39, 174, 96, 0.4)',
          borderRadius: '4px',
          fontSize: '0.65rem',
          color: '#27ae60'
        }}>
          ✓ Captures similarity
        </div>
        <div style={{
          padding: '6px 10px',
          background: 'rgba(231, 76, 60, 0.2)',
          border: '1px solid rgba(231, 76, 60, 0.4)',
          borderRadius: '4px',
          fontSize: '0.65rem',
          color: '#e74c3c'
        }}>
          ✗ No word order
        </div>
        <div style={{
          padding: '6px 10px',
          background: 'rgba(231, 76, 60, 0.2)',
          border: '1px solid rgba(231, 76, 60, 0.4)',
          borderRadius: '4px',
          fontSize: '0.65rem',
          color: '#e74c3c'
        }}>
          ✗ Static (no context)
        </div>
      </div>
    </div>
  )
}

export default Word2VecVisualization
