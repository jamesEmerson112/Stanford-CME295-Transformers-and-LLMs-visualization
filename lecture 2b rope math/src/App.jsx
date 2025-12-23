import React, { useState } from 'react'
import RoPEMathVisualization from './components/RoPEMathVisualization'

const TABS = [
  { id: 0, label: '2D Pairs', name: 'Why 2D Rotation Pairs?' },
  { id: 1, label: 'Frequencies', name: 'Multi-Frequency Rotations' },
  { id: 2, label: 'Derivation', name: 'Mathematical Derivation' },
  { id: 3, label: 'Benefits', name: 'Why RoPE Works' }
]

export default function App() {
  const [currentTab, setCurrentTab] = useState(0)

  return (
    <div className="app-container">
      {/* Header with Tabs */}
      <header className="header-compact">
        <div className="header-top">
          <h1>RoPE: The Mathematics</h1>
          <p className="subtitle">Understanding the theory behind Rotary Position Embeddings</p>
        </div>

        {/* Tab Navigation */}
        <nav className="tab-navigation">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${currentTab === tab.id ? 'active' : ''}`}
              onClick={() => setCurrentTab(tab.id)}
            >
              <span className="tab-number">{tab.id + 1}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <RoPEMathVisualization currentTab={currentTab} />
      </main>

      {/* Bottom Info Bar */}
      <footer className="bottom-bar">
        <div className="tab-info">
          {TABS[currentTab].name}
        </div>
        <div className="nav-buttons">
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
