import React from 'react'

function LSTMVisualization({ tokens, currentStep }) {
  // Simulate gate states for each token based on semantic importance
  const getGateStates = (tokenIndex) => {
    const token = tokens[tokenIndex]?.toLowerCase() || ''

    // Key content words - high input gate (remember), low forget (keep previous)
    if (['67', 'number', 'popular', 'youth'].includes(token)) {
      return { forget: 0.2, input: 0.9, output: 0.8, importance: 'high' }
    }
    // Action/change words - moderate gates
    if (['suddenly', 'becomes'].includes(token)) {
      return { forget: 0.4, input: 0.7, output: 0.7, importance: 'medium' }
    }
    // Function words - high forget (less important), low input
    if (['the', 'among', 'a', 'on', 'in'].includes(token)) {
      return { forget: 0.8, input: 0.3, output: 0.4, importance: 'low' }
    }
    return { forget: 0.5, input: 0.6, output: 0.6, importance: 'medium' }
  }

  // Calculate cumulative cell state "fullness" based on what's been remembered
  const getCellStateLevel = () => {
    let level = 0
    for (let i = 0; i < currentStep && i < tokens.length; i++) {
      const gates = getGateStates(i)
      level = level * (1 - gates.forget * 0.3) + gates.input * 0.15
    }
    return Math.min(1, level)
  }

  const cellStateLevel = getCellStateLevel()

  return (
    <div className="viz-content">
      {/* LSTM Cell Diagram */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '12px',
        padding: '8px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        fontSize: '0.65rem'
      }}>
        <div style={{ textAlign: 'center', color: '#888' }}>
          <div style={{
            width: '35px',
            height: '25px',
            background: 'rgba(123, 44, 191, 0.4)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #7b2cbf',
            fontSize: '0.6rem'
          }}>
            C<sub>t-1</sub>
          </div>
          cell
        </div>
        <span style={{ color: '#666' }}>→</span>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px'
        }}>
          <div style={{
            display: 'flex',
            gap: '3px'
          }}>
            <div style={{
              width: '22px',
              height: '18px',
              background: '#e74c3c',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.55rem',
              fontWeight: 'bold'
            }}>f</div>
            <div style={{
              width: '22px',
              height: '18px',
              background: '#27ae60',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.55rem',
              fontWeight: 'bold'
            }}>i</div>
            <div style={{
              width: '22px',
              height: '18px',
              background: '#3498db',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.55rem',
              fontWeight: 'bold'
            }}>o</div>
          </div>
          <div style={{ color: '#888' }}>gates</div>
        </div>
        <span style={{ color: '#666' }}>→</span>
        <div style={{ textAlign: 'center', color: '#888' }}>
          <div style={{
            width: '35px',
            height: '25px',
            background: 'rgba(0, 212, 255, 0.4)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #00d4ff',
            fontSize: '0.6rem'
          }}>
            C<sub>t</sub>
          </div>
          cell
        </div>
      </div>

      {/* Token display with importance indicators */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '3px',
        marginBottom: '8px'
      }}>
        {tokens.map((token, idx) => {
          const gates = getGateStates(idx)
          const isProcessed = idx < currentStep
          const isCurrent = idx === currentStep - 1

          return (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div
                className={`token ${isProcessed ? 'processed' : 'pending'}`}
                style={{
                  fontSize: '0.7rem',
                  padding: '3px 5px',
                  border: isCurrent ? '2px solid #00d4ff' : 'none',
                  boxShadow: isCurrent ? '0 0 8px rgba(0,212,255,0.5)' : 'none'
                }}
              >
                {token}
              </div>
              {isProcessed && (
                <div style={{
                  width: '100%',
                  height: '3px',
                  marginTop: '2px',
                  borderRadius: '2px',
                  background: gates.importance === 'high' ? '#27ae60' :
                             gates.importance === 'medium' ? '#f39c12' : '#666'
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Cell State Highway with level indicator */}
      <div style={{ width: '100%', padding: '0 15px', marginTop: '8px' }}>
        <div style={{
          position: 'relative',
          height: '12px',
          background: 'rgba(60, 60, 80, 0.5)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${cellStateLevel * 100}%`,
            background: 'linear-gradient(90deg, #7b2cbf, #00d4ff)',
            borderRadius: '6px',
            transition: 'width 0.5s',
            boxShadow: currentStep > 0 ? '0 0 8px rgba(0, 212, 255, 0.4)' : 'none'
          }} />
        </div>
        <div style={{ fontSize: '0.65rem', color: '#888', textAlign: 'center', marginTop: '4px' }}>
          Cell State (long-term memory) - {(cellStateLevel * 100).toFixed(0)}% utilized
        </div>
      </div>

      {/* Gate visualization for current token */}
      {currentStep > 0 && currentStep <= tokens.length && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '6px', textAlign: 'center' }}>
            Gates for "<span style={{ color: '#00d4ff' }}>{tokens[currentStep - 1]}</span>"
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            {(() => {
              const gates = getGateStates(currentStep - 1)
              return (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '45px',
                      height: '30px',
                      background: `rgba(231, 76, 60, ${gates.forget})`,
                      border: '2px solid #e74c3c',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.8rem'
                    }}>
                      {(gates.forget * 100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#e74c3c', marginTop: '2px' }}>Forget</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '45px',
                      height: '30px',
                      background: `rgba(39, 174, 96, ${gates.input})`,
                      border: '2px solid #27ae60',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.8rem'
                    }}>
                      {(gates.input * 100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#27ae60', marginTop: '2px' }}>Input</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '45px',
                      height: '30px',
                      background: `rgba(52, 152, 219, ${gates.output})`,
                      border: '2px solid #3498db',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.8rem'
                    }}>
                      {(gates.output * 100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#3498db', marginTop: '2px' }}>Output</div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Key insight - shows when important tokens are remembered */}
      {currentStep >= 5 && (
        <div style={{
          marginTop: '10px',
          padding: '6px 10px',
          background: 'rgba(0, 212, 255, 0.15)',
          border: '1px solid rgba(0, 212, 255, 0.4)',
          borderRadius: '6px',
          fontSize: '0.7rem',
          color: '#00d4ff',
          textAlign: 'center'
        }}>
          ✓ Key words ("67", "popular") preserved in cell state via low forget gates
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '8px',
        fontSize: '0.6rem',
        color: '#666'
      }}>
        <span><span style={{ color: '#27ae60' }}>●</span> Important</span>
        <span><span style={{ color: '#f39c12' }}>●</span> Moderate</span>
        <span><span style={{ color: '#666' }}>●</span> Function word</span>
      </div>
    </div>
  )
}

export default LSTMVisualization
