import React, { useState, useEffect } from 'react'
import AttentionVisualization from './components/AttentionVisualization'

const DEFAULT_PHRASE = "The cat sat"

const STEPS = [
  { id: 0, name: 'Input Tokens', description: 'Convert words to token embeddings' },
  { id: 1, name: 'Q, K, V Projection', description: 'Project embeddings into Query, Key, Value vectors' },
  { id: 2, name: 'Attention Scores', description: 'Compute QK^T dot products' },
  { id: 3, name: 'Scaling', description: 'Divide by √d_k to stabilize gradients' },
  { id: 4, name: 'Softmax', description: 'Normalize scores to attention weights' },
  { id: 5, name: 'Output', description: 'Compute weighted sum of Values' }
]

export default function App() {
  const [phrase, setPhrase] = useState(DEFAULT_PHRASE)
  const [inputPhrase, setInputPhrase] = useState(DEFAULT_PHRASE)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [multiHead, setMultiHead] = useState(false)

  const maxSteps = STEPS.length - 1

  // Auto-advance when playing (loops with pause at end)
  useEffect(() => {
    if (isPlaying && currentStep < maxSteps) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 2000)
      return () => clearTimeout(timer)
    } else if (isPlaying && currentStep >= maxSteps) {
      // Pause at end, then restart loop
      const timer = setTimeout(() => {
        setCurrentStep(0)
      }, 3000) // 3 second pause before restarting
      return () => clearTimeout(timer)
    }
  }, [isPlaying, currentStep, maxSteps])

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleStep = () => {
    setIsPlaying(false)
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      setCurrentStep(0)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const handlePhraseSubmit = () => {
    setPhrase(inputPhrase)
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePhraseSubmit()
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Attention Mechanism</h1>
        <div className="formula">softmax(QK<sup>T</sup> / √d<sub>k</sub>) V</div>
      </header>

      <div className="controls">
        <div className="input-section">
          <label>Input:</label>
          <input
            type="text"
            value={inputPhrase}
            onChange={(e) => setInputPhrase(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a phrase..."
          />
          <button className="btn btn-secondary" onClick={handlePhraseSubmit}>
            Update
          </button>
        </div>
      </div>

      <AttentionVisualization
        phrase={phrase}
        currentStep={currentStep}
        multiHead={multiHead}
      />

      {/* Floating Control Panel */}
      <div className="floating-controls">
        <div className="floating-step-label">
          Step {currentStep + 1}/{STEPS.length}: {STEPS[currentStep].name}
        </div>

        <div className="step-indicator">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={`step-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
              title={step.name}
            />
          ))}
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={handlePlay}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button className="btn btn-secondary" onClick={handleStep}>
            Step
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>

        <div className="toggle-group">
          <label>Multi-Head:</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={multiHead}
              onChange={(e) => setMultiHead(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  )
}
