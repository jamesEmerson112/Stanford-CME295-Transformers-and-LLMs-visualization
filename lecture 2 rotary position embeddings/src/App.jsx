import React, { useState, useEffect } from 'react'
import RoPEVisualization from './components/RoPEVisualization'

const DEFAULT_PHRASE = "The cat sat at home"

const TABS = [
  { id: 0, label: 'Input', name: 'Input Tokens' },
  { id: 1, label: 'Matrix', name: 'Rotation Matrix' },
  { id: 2, label: 'Rotate', name: 'Position Rotations' },
  { id: 3, label: 'Q/K', name: 'Q & K Rotation' },
  { id: 4, label: 'Angles', name: 'Angular Difference' },
  { id: 5, label: 'Attention', name: 'Attention Scores' },
  { id: 6, label: 'Compare', name: 'RoPE vs Traditional' }
]

export default function App() {
  const [phrase, setPhrase] = useState(DEFAULT_PHRASE)
  const [inputPhrase, setInputPhrase] = useState(DEFAULT_PHRASE)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [thetaBase, setThetaBase] = useState(30) // degrees
  const [showComparison, setShowComparison] = useState(false)

  const maxSteps = TABS.length - 1

  // Auto-advance when playing
  useEffect(() => {
    if (isPlaying && currentStep < maxSteps) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 2500)
      return () => clearTimeout(timer)
    } else if (isPlaying && currentStep >= maxSteps) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, maxSteps])

  const handleTabClick = (tabId) => {
    setIsPlaying(false)
    setCurrentStep(tabId)
  }

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
    <div className="app-container tabbed-layout">
      {/* Compact Header with Tabs */}
      <header className="header-compact">
        <div className="header-top">
          <h1>RoPE: Rotary Position Embeddings</h1>
          <div className="header-controls">
            <div className="input-inline">
              <input
                type="text"
                value={inputPhrase}
                onChange={(e) => setInputPhrase(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter phrase..."
              />
              <button className="btn btn-small" onClick={handlePhraseSubmit}>
                Update
              </button>
            </div>
            <div className="theta-inline">
              <label>θ: {thetaBase}°</label>
              <input
                type="range"
                min="5"
                max="90"
                value={thetaBase}
                onChange={(e) => setThetaBase(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="tab-navigation">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${currentStep === tab.id ? 'active' : ''} ${currentStep > tab.id ? 'completed' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className="tab-number">{tab.id + 1}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area - Fixed Height */}
      <main className="main-content">
        <RoPEVisualization
          phrase={phrase}
          currentStep={currentStep}
          thetaBase={thetaBase}
          showComparison={showComparison}
        />
      </main>

      {/* Compact Bottom Controls */}
      <footer className="bottom-controls">
        <div className="control-row">
          <div className="step-info">
            {TABS[currentStep].name}
          </div>
          <div className="button-group">
            <button className="btn btn-primary" onClick={handlePlay}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button className="btn btn-secondary" onClick={handleStep}>
              Next
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
          {currentStep === 6 && (
            <div className="toggle-inline">
              <label>
                <input
                  type="checkbox"
                  checked={showComparison}
                  onChange={(e) => setShowComparison(e.target.checked)}
                />
                Show Comparison
              </label>
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}
