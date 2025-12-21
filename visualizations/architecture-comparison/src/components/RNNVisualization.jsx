import React from 'react'

function RNNVisualization({ tokens, currentStep }) {
  // Simulate hidden state values with decay
  const getHiddenStateValues = () => {
    const values = []
    for (let i = 0; i < 8; i++) {
      // Each dimension has different "memory" of past tokens
      let val = 0
      for (let t = 0; t < currentStep && t < tokens.length; t++) {
        const decay = Math.pow(0.7, currentStep - t - 1) // Exponential decay
        const contribution = ((tokens[t].charCodeAt(0) + i * 17) % 100) / 100
        val += contribution * decay
      }
      values.push(Math.min(1, val))
    }
    return values
  }

  const hiddenState = getHiddenStateValues()

  // Get intensity for "memory" of a specific token
  const getTokenMemory = (tokenIdx) => {
    if (tokenIdx >= currentStep) return 0
    const decay = Math.pow(0.7, currentStep - tokenIdx - 1)
    return decay
  }

  return (
    <div className="viz-content">
      {/* RNN Cell Diagram */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginBottom: '15px',
        padding: '10px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#888' }}>
          <div style={{
            width: '50px',
            height: '30px',
            background: currentStep > 0 ? 'rgba(123, 44, 191, 0.5)' : 'rgba(60,60,80,0.5)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '3px',
            border: '1px solid #7b2cbf'
          }}>
            h<sub>{Math.max(0, currentStep - 1)}</sub>
          </div>
          prev state
        </div>
        <span style={{ color: '#666', fontSize: '1.2rem' }}>→</span>
        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#888' }}>
          <div style={{
            width: '70px',
            height: '50px',
            background: currentStep > 0 ? 'linear-gradient(135deg, #00d4ff33, #7b2cbf33)' : 'rgba(60,60,80,0.5)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: currentStep > 0 ? '2px solid #00d4ff' : '1px solid #555',
            fontWeight: 'bold',
            color: currentStep > 0 ? '#00d4ff' : '#666'
          }}>
            RNN Cell
          </div>
          tanh(Wx + Uh)
        </div>
        <span style={{ color: '#666', fontSize: '1.2rem' }}>→</span>
        <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#888' }}>
          <div style={{
            width: '50px',
            height: '30px',
            background: currentStep > 0 ? 'rgba(0, 212, 255, 0.5)' : 'rgba(60,60,80,0.5)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '3px',
            border: '1px solid #00d4ff'
          }}>
            h<sub>{currentStep}</sub>
          </div>
          new state
        </div>
      </div>

      {/* Token sequence with memory indicators */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '3px',
        marginBottom: '10px'
      }}>
        {tokens.map((token, idx) => {
          const memory = getTokenMemory(idx)
          const isProcessed = idx < currentStep
          const isCurrent = idx === currentStep - 1

          return (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div
                className={`token ${isProcessed ? 'processed' : 'pending'}`}
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 6px',
                  border: isCurrent ? '2px solid #00d4ff' : 'none',
                  boxShadow: isCurrent ? '0 0 10px rgba(0,212,255,0.5)' : 'none'
                }}
              >
                {token}
              </div>
              {isProcessed && (
                <div style={{
                  height: '4px',
                  background: `rgba(0, 212, 255, ${memory})`,
                  borderRadius: '2px',
                  marginTop: '3px',
                  transition: 'all 0.3s'
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Hidden state vector visualization */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '4px',
        height: '60px',
        marginTop: '10px'
      }}>
        {hiddenState.map((val, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              width: '20px',
              height: `${Math.max(5, val * 50)}px`,
              background: `linear-gradient(to top, #7b2cbf, #00d4ff)`,
              opacity: currentStep > 0 ? 0.3 + val * 0.7 : 0.2,
              borderRadius: '3px 3px 0 0',
              transition: 'all 0.3s'
            }} />
          </div>
        ))}
      </div>
      <div style={{ fontSize: '0.7rem', color: '#888', textAlign: 'center', marginTop: '5px' }}>
        Hidden State Vector (8 dimensions)
      </div>

      {/* Vanishing gradient warning */}
      {currentStep > 5 && (
        <div style={{
          marginTop: '10px',
          padding: '8px',
          background: 'rgba(231, 76, 60, 0.15)',
          border: '1px solid rgba(231, 76, 60, 0.4)',
          borderRadius: '6px',
          fontSize: '0.7rem',
          color: '#e74c3c',
          textAlign: 'center'
        }}>
          ⚠ Early tokens fading from memory (vanishing gradient problem)
        </div>
      )}
    </div>
  )
}

export default RNNVisualization
