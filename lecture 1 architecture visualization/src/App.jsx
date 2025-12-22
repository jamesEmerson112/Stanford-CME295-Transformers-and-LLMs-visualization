import React, { useState } from 'react'
import RNNVisualization from './components/RNNVisualization'
import LSTMVisualization from './components/LSTMVisualization'
import Word2VecVisualization from './components/Word2VecVisualization'
import TransformerVisualization from './components/TransformerVisualization'
import LLMVisualization from './components/LLMVisualization'

const DEFAULT_PHRASE = "Number 67 suddenly becomes popular among the youth"

function App() {
  const [phrase, setPhrase] = useState(DEFAULT_PHRASE)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const tokens = phrase.split(' ')
  const maxSteps = tokens.length

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const handleStepForward = () => {
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Auto-advance when playing (loops with pause at end)
  React.useEffect(() => {
    if (isPlaying && currentStep < maxSteps) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isPlaying && currentStep >= maxSteps) {
      // Pause at end, then restart loop
      const timer = setTimeout(() => {
        setCurrentStep(0)
      }, 2000) // 2 second pause before restarting
      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, maxSteps])

  return (
    <div className="app">
      <header className="header">
        <h1>Architecture Comparison</h1>
        <p className="subtitle">
          How different NLP architectures process the same phrase
        </p>
      </header>

      <div className="input-section">
        <label htmlFor="phrase-input">Input Phrase:</label>
        <input
          id="phrase-input"
          type="text"
          value={phrase}
          onChange={(e) => {
            setPhrase(e.target.value)
            setCurrentStep(0)
            setIsPlaying(false)
          }}
          className="phrase-input"
        />
      </div>

      <div className="controls">
        <button onClick={handleStepBackward} disabled={currentStep === 0}>
          ← Step Back
        </button>
        {isPlaying ? (
          <button onClick={handlePause}>⏸ Pause</button>
        ) : (
          <button onClick={handlePlay} disabled={currentStep >= maxSteps}>
            ▶ Play
          </button>
        )}
        <button onClick={handleStepForward} disabled={currentStep >= maxSteps}>
          Step Forward →
        </button>
        <button onClick={handleReset}>↺ Reset</button>
        <span className="step-indicator">
          Step: {currentStep} / {maxSteps}
        </span>
      </div>

      {/* First row: 4 foundational architectures */}
      <div className="visualization-grid">
        <div className="viz-panel">
          <h2>RNN</h2>
          <p className="viz-description">Sequential processing with hidden state</p>
          <RNNVisualization tokens={tokens} currentStep={currentStep} />
        </div>

        <div className="viz-panel">
          <h2>LSTM</h2>
          <p className="viz-description">Gates preserve long-term memory</p>
          <LSTMVisualization tokens={tokens} currentStep={currentStep} />
        </div>

        <div className="viz-panel">
          <h2>Word2Vec</h2>
          <p className="viz-description">Static embeddings, no sequence</p>
          <Word2VecVisualization tokens={tokens} currentStep={currentStep} />
        </div>

        <div className="viz-panel">
          <h2>Transformer</h2>
          <p className="viz-description">Parallel attention mechanism</p>
          <TransformerVisualization tokens={tokens} currentStep={currentStep} />
        </div>
      </div>

      {/* Second row: LLM gets full width */}
      <div className="viz-panel viz-panel-full">
        <h2>LLM (Large Language Model)</h2>
        <p className="viz-description">Multi-layer transformer with autoregressive generation</p>
        <LLMVisualization tokens={tokens} currentStep={currentStep} />
      </div>

      <footer className="footer">
        <p>Stanford CME 295: Transformers and Large Language Models</p>
      </footer>
    </div>
  )
}

export default App
