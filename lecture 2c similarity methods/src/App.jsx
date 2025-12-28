import React, { useState } from 'react'
import SimilarityVisualization from './components/SimilarityVisualization'

const TABS = [
  { id: 0, label: 'Problem', name: 'Why Similarity Matters' },
  { id: 1, label: 'Methods', name: 'Six Similarity Methods' },
  { id: 2, label: 'Vectors', name: 'Interactive Vector Space' },
  { id: 3, label: 'Magnitude', name: 'The Magnitude Problem' },
  { id: 4, label: 'Cosine Wins', name: 'Why Cosine is Best' },
  { id: 5, label: 'Summary', name: 'Applications & Summary' }
]

export default function App() {
  const [currentTab, setCurrentTab] = useState(0)
  const [selectedPreset, setSelectedPreset] = useState('analogy')
  const [is3DView, setIs3DView] = useState(false)
  const [magnitudeScale, setMagnitudeScale] = useState(1.0)
  const [selectedPair, setSelectedPair] = useState(['king', 'queen'])

  const handleTabClick = (tabId) => {
    setCurrentTab(tabId)
  }

  return (
    <div className="app-container tabbed-layout">
      <header className="header-compact">
        <div className="header-top">
          <h1>Similarity Methods</h1>
          <p className="subtitle">Understanding how to measure semantic similarity</p>
        </div>
        <nav className="tab-navigation">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${currentTab === tab.id ? 'active' : ''} ${currentTab > tab.id ? 'completed' : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className="tab-number">{tab.id + 1}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="main-content">
        <SimilarityVisualization
          currentTab={currentTab}
          selectedPreset={selectedPreset}
          setSelectedPreset={setSelectedPreset}
          is3DView={is3DView}
          setIs3DView={setIs3DView}
          magnitudeScale={magnitudeScale}
          setMagnitudeScale={setMagnitudeScale}
          selectedPair={selectedPair}
          setSelectedPair={setSelectedPair}
        />
      </main>

      <footer className="bottom-controls">
        <div className="step-info">
          {TABS[currentTab].name}
        </div>
        <div className="button-group">
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentTab(Math.max(0, currentTab - 1))}
            disabled={currentTab === 0}
          >
            Previous
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setCurrentTab(Math.min(TABS.length - 1, currentTab + 1))}
            disabled={currentTab === TABS.length - 1}
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  )
}
