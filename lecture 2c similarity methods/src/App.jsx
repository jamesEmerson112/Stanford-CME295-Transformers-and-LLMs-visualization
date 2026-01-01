import React, { useState, useCallback, useMemo } from 'react'
import { PCA } from 'ml-pca'
import VectorSpace3D from './components/VectorSpace3D'
import embeddingsData from './data/embeddings.json'

// ============ SIMILARITY FUNCTIONS (operate on full 384D vectors) ============

function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0))
}

function manhattanDistance(a, b) {
  return a.reduce((sum, val, i) => sum + Math.abs(val - b[i]), 0)
}

function dotProduct(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0)
}

function magnitude(v) {
  return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0))
}

function cosineSimilarity(a, b) {
  const dot = dotProduct(a, b)
  const magA = magnitude(a)
  const magB = magnitude(b)
  if (magA === 0 || magB === 0) return 0
  return dot / (magA * magB)
}

function pearsonCorrelation(a, b) {
  const meanA = a.reduce((s, v) => s + v, 0) / a.length
  const meanB = b.reduce((s, v) => s + v, 0) / b.length
  const centeredA = a.map(v => v - meanA)
  const centeredB = b.map(v => v - meanB)
  return cosineSimilarity(centeredA, centeredB)
}

function jaccardSimilarity(a, b) {
  // For continuous vectors, use a threshold-based approach
  let intersection = 0, union = 0
  for (let i = 0; i < a.length; i++) {
    const aPos = a[i] > 0
    const bPos = b[i] > 0
    if (aPos || bPos) union++
    if (aPos && bPos) intersection++
  }
  return union === 0 ? 0 : intersection / union
}

// ============ METRIC DEFINITIONS ============

const METRICS = [
  { id: 'euclidean', name: 'Euclidean Distance', shortName: 'L2', formula: 'd = √Σ(aᵢ-bᵢ)²', isDistance: true },
  { id: 'dot', name: 'Dot Product', shortName: 'a·b', formula: 'a · b = Σ(aᵢ × bᵢ)', isDistance: false },
  { id: 'cosine', name: 'Cosine Similarity', shortName: 'cos', formula: 'cos(θ) = (a·b)/(|a||b|)', isDistance: false, highlight: true },
  { id: 'manhattan', name: 'Manhattan Distance', shortName: 'L1', formula: 'd = Σ|aᵢ - bᵢ|', isDistance: true },
  { id: 'jaccard', name: 'Jaccard Similarity', shortName: 'J', formula: 'J = |A∩B| / |A∪B|', isDistance: false },
  { id: 'pearson', name: 'Pearson Correlation', shortName: 'r', formula: 'r = cov(a,b)/(σₐσᵦ)', isDistance: false }
]

// ============ MAIN APP ============

export default function App() {
  // Process embeddings: compute PCA for 3D visualization
  const { vectors3D, vectorsFull, sentences } = useMemo(() => {
    const sentences = Object.keys(embeddingsData)
    const fullEmbeddings = Object.values(embeddingsData)

    // PCA: 384D → 3D for visualization
    const pca = new PCA(fullEmbeddings)
    const projected = pca.predict(fullEmbeddings, { nComponents: 3 })

    // Build vectors objects
    const vectors3D = {}
    const vectorsFull = {}

    sentences.forEach((sentence, i) => {
      // 3D vectors for visualization (scaled for better display)
      const row = projected.getRow(i)
      vectors3D[sentence] = [row[0] * 2, row[1] * 2, row[2] * 2]

      // Full 384D vectors for accurate similarity calculations
      vectorsFull[sentence] = fullEmbeddings[i]
    })

    return { vectors3D, vectorsFull, sentences }
  }, [])

  const [selectedPair, setSelectedPair] = useState([sentences[0], sentences[1]])
  const [cameraState, setCameraState] = useState(null)
  const [magnitudeScale, setMagnitudeScale] = useState(1.0)

  // Calculate metrics using FULL 384D vectors (accurate scores)
  const calculateMetric = useCallback((metricId, v1, v2) => {
    // Apply magnitude scale to first vector
    const scaledV1 = magnitudeScale !== 1 ? v1.map(v => v * magnitudeScale) : v1

    switch (metricId) {
      case 'euclidean': return euclideanDistance(scaledV1, v2)
      case 'dot': return dotProduct(scaledV1, v2)
      case 'cosine': return cosineSimilarity(scaledV1, v2)
      case 'manhattan': return manhattanDistance(scaledV1, v2)
      case 'jaccard': return jaccardSimilarity(scaledV1, v2)
      case 'pearson': return pearsonCorrelation(scaledV1, v2)
      default: return 0
    }
  }, [magnitudeScale])

  // Get metric values using full vectors
  const v1Full = vectorsFull[selectedPair[0]]
  const v2Full = vectorsFull[selectedPair[1]]

  const metricValues = METRICS.reduce((acc, m) => {
    acc[m.id] = v1Full && v2Full ? calculateMetric(m.id, v1Full, v2Full) : 0
    return acc
  }, {})

  // Handle camera sync
  const handleCameraChange = useCallback((newState) => {
    setCameraState(newState)
  }, [])

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <h1>Similarity Methods Comparison</h1>
          <p className="subtitle">Real sentence embeddings from all-MiniLM-L6-v2 (384 dimensions)</p>
        </div>

        <div className="header-controls">
          <div className="control-group">
            <label>Compare:</label>
            <select value={selectedPair[0]} onChange={(e) => setSelectedPair([e.target.value, selectedPair[1]])}>
              {sentences.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="vs">vs</span>
            <select value={selectedPair[1]} onChange={(e) => setSelectedPair([selectedPair[0], e.target.value])}>
              {sentences.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="control-group magnitude-control">
            <label>Scale first vector ({magnitudeScale.toFixed(1)}x):</label>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={magnitudeScale}
              onChange={(e) => setMagnitudeScale(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </header>

      <div className="insight-banner">
        <strong>Real Embeddings:</strong> Using sentence-transformers/all-MiniLM-L6-v2 model.
        Notice how <em>Cosine Similarity</em> stays constant when you scale the first vector - it only measures <em>direction</em>, not magnitude!
      </div>

      <main className="similarity-grid">
        {METRICS.map((metric) => (
          <div key={metric.id} className={`method-panel ${metric.highlight ? 'highlight' : ''}`}>
            <div className="method-header">
              <span className={`method-icon ${metric.highlight ? 'star' : ''}`}>{metric.shortName}</span>
              <h3>{metric.name}</h3>
              {metric.highlight && <span className="best-badge">BEST FOR NLP</span>}
            </div>

            <div className="method-canvas">
              <VectorSpace3D
                vectors={vectors3D}
                selectedPair={selectedPair}
                metricType={metric.id}
                metricValue={metricValues[metric.id]}
                highlight={metric.highlight}
                cameraState={cameraState}
                onCameraChange={handleCameraChange}
                magnitudeScale={magnitudeScale}
              />
            </div>

            <div className="method-footer">
              <div className="metric-value">
                {metric.isDistance ? 'Distance: ' : 'Score: '}
                <strong className={metric.id === 'cosine' && magnitudeScale !== 1 ? 'stable' : ''}>
                  {metricValues[metric.id].toFixed(4)}
                </strong>
              </div>
              <div className="metric-formula">{metric.formula}</div>
              {metric.id === 'cosine' && magnitudeScale !== 1 && (
                <div className="stable-indicator">Magnitude invariant!</div>
              )}
            </div>
          </div>
        ))}
      </main>

      <footer className="footer">
        <div className="footer-hint">
          3D view shows PCA projection of 384D embeddings. Similarity scores computed on full vectors. Drag to rotate all views.
        </div>
      </footer>
    </div>
  )
}
