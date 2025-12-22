import React, { useMemo } from 'react'

// Simulated embedding dimension
const D_K = 64
const SQRT_D_K = Math.sqrt(D_K)

// Generate deterministic "random" values based on token
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generateEmbedding(token, dim = 4) {
  const seed = token.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0)
  return Array.from({ length: dim }, (_, i) =>
    Math.round((seededRandom(seed + i) * 2 - 1) * 100) / 100
  )
}

function generateQKV(tokens) {
  const Q = tokens.map((token, i) => generateEmbedding(token + 'Q' + i, 4))
  const K = tokens.map((token, i) => generateEmbedding(token + 'K' + i, 4))
  const V = tokens.map((token, i) => generateEmbedding(token + 'V' + i, 4))
  return { Q, K, V }
}

// Linguistic relationship patterns for realistic attention
function getRelationshipScore(fromToken, toToken, fromIdx, toIdx) {
  const from = fromToken.toLowerCase()
  const to = toToken.toLowerCase()

  // Define word categories
  const determiners = ['the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her']
  const verbs = ['sat', 'sits', 'sit', 'is', 'was', 'were', 'are', 'has', 'have', 'had', 'does', 'did', 'becomes', 'became', 'runs', 'ran', 'walks', 'walked', 'jumps', 'jumped', 'eats', 'ate', 'sleeps', 'slept', 'loves', 'loved', 'likes', 'liked', 'wants', 'wanted', 'needs', 'needed', 'sees', 'saw', 'knows', 'knew', 'thinks', 'thought', 'feels', 'felt', 'makes', 'made', 'takes', 'took', 'comes', 'came', 'goes', 'went', 'gives', 'gave', 'tells', 'told', 'asks', 'asked', 'works', 'worked', 'seems', 'seemed', 'leaves', 'left', 'calls', 'called', 'tries', 'tried', 'puts', 'kept', 'lets', 'begins', 'began', 'helps', 'helped', 'shows', 'showed', 'hears', 'heard', 'plays', 'played', 'moves', 'moved', 'lives', 'lived', 'believes', 'believed', 'brings', 'brought', 'happens', 'happened', 'writes', 'wrote', 'provides', 'provided', 'stands', 'stood', 'loses', 'lost', 'pays', 'paid', 'meets', 'met', 'includes', 'included', 'continues', 'continued', 'sets', 'learns', 'learned', 'changes', 'changed', 'leads', 'led', 'understands', 'understood', 'watches', 'watched', 'follows', 'followed', 'stops', 'stopped', 'creates', 'created', 'speaks', 'spoke', 'reads', 'read', 'allows', 'allowed', 'adds', 'added', 'spends', 'spent', 'grows', 'grew', 'opens', 'opened', 'walks', 'walked', 'wins', 'won', 'offers', 'offered', 'remembers', 'remembered', 'considers', 'considered', 'appears', 'appeared', 'buys', 'bought', 'waits', 'waited', 'serves', 'served', 'dies', 'died', 'sends', 'sent', 'expects', 'expected', 'builds', 'built', 'stays', 'stayed', 'falls', 'fell', 'cuts', 'reaches', 'reached', 'kills', 'killed', 'remains', 'remained', 'suggests', 'suggested', 'raises', 'raised', 'passes', 'passed', 'sells', 'sold', 'requires', 'required', 'reports', 'reported', 'decides', 'decided', 'pulls', 'pulled']
  const prepositions = ['at', 'on', 'in', 'to', 'for', 'with', 'by', 'from', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'over', 'among']
  const nouns = ['cat', 'dog', 'home', 'house', 'car', 'book', 'person', 'man', 'woman', 'child', 'time', 'day', 'year', 'way', 'thing', 'world', 'life', 'hand', 'part', 'place', 'case', 'week', 'company', 'system', 'program', 'question', 'work', 'government', 'number', 'night', 'point', 'word', 'business', 'issue', 'side', 'kind', 'head', 'far', 'eye', 'face', 'room', 'mother', 'area', 'money', 'story', 'fact', 'month', 'lot', 'right', 'study', 'job', 'word', 'family', 'school', 'student', 'group', 'country', 'problem', 'service', 'friend', 'state', 'hour', 'game', 'member', 'power', 'law', 'door', 'water', 'table', 'food', 'music', 'youth', 'popular', 'suddenly', 'morning', 'evening', 'afternoon', 'mat', 'ball', 'tree', 'flower', 'sun', 'moon', 'star', 'sky', 'bird', 'fish']
  const pronouns = ['it', 'he', 'she', 'they', 'we', 'i', 'you', 'him', 'her', 'them', 'us', 'me']
  const adjectives = ['big', 'small', 'large', 'little', 'good', 'bad', 'new', 'old', 'young', 'long', 'short', 'high', 'low', 'great', 'popular', 'sudden', 'quick', 'slow', 'fast', 'tired', 'happy', 'sad', 'beautiful', 'ugly', 'hot', 'cold', 'warm', 'cool', 'bright', 'dark']
  const adverbs = ['suddenly', 'quickly', 'slowly', 'very', 'really', 'always', 'never', 'often', 'sometimes', 'usually', 'probably', 'certainly', 'definitely', 'finally', 'actually', 'immediately', 'recently', 'currently', 'previously', 'originally']

  let score = 0

  // Self-attention (tokens attend somewhat to themselves)
  if (fromIdx === toIdx) {
    score += 3
  }

  // Adjacent tokens have some natural attention
  if (Math.abs(fromIdx - toIdx) === 1) {
    score += 1.5
  }

  // Verbs attend strongly to preceding nouns (subject-verb)
  if (verbs.includes(from)) {
    // Look for subject (nouns before the verb)
    if (toIdx < fromIdx && (nouns.includes(to) || pronouns.includes(to))) {
      score += 4 + (1 / (fromIdx - toIdx)) // Closer nouns get more attention
    }
  }

  // Nouns attend to their determiners
  if (nouns.includes(from) || adjectives.includes(from)) {
    if (toIdx === fromIdx - 1 && determiners.includes(to)) {
      score += 5
    }
    // Nouns also attend to preceding adjectives
    if (toIdx < fromIdx && adjectives.includes(to)) {
      score += 3
    }
  }

  // Preposition objects attend to prepositions
  if (nouns.includes(from) && toIdx === fromIdx - 1 && prepositions.includes(to)) {
    score += 5
  }

  // Pronouns attend strongly to their likely referents (nouns before them)
  if (pronouns.includes(from)) {
    if (toIdx < fromIdx && nouns.includes(to)) {
      score += 4 + (2 / (fromIdx - toIdx))
    }
  }

  // Adverbs attend to verbs
  if (adverbs.includes(from)) {
    if (verbs.includes(to)) {
      score += 4
    }
  }

  // Adjectives attend to the nouns they modify
  if (adjectives.includes(from)) {
    if (toIdx === fromIdx + 1 && nouns.includes(to)) {
      score += 4
    }
  }

  // Add some base noise to make it more realistic
  const seed = from.charCodeAt(0) * 17 + to.charCodeAt(0) * 31 + fromIdx * 7 + toIdx * 13
  score += seededRandom(seed) * 0.5

  return Math.round(score * 100) / 100
}

function computeAttentionScores(tokens) {
  // Generate linguistically meaningful attention scores
  return tokens.map((fromToken, i) =>
    tokens.map((toToken, j) => getRelationshipScore(fromToken, toToken, i, j))
  )
}

function scaleScores(scores) {
  return scores.map(row =>
    row.map(val => Math.round((val / SQRT_D_K) * 100) / 100)
  )
}

function softmax(row) {
  const maxVal = Math.max(...row)
  const exps = row.map(val => Math.exp(val - maxVal))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(val => Math.round((val / sum) * 100) / 100)
}

function applySoftmax(scaledScores) {
  return scaledScores.map(row => softmax(row))
}

function getHeatmapColor(value, min, max) {
  const normalized = (value - min) / (max - min || 1)
  const r = Math.round(255 * normalized)
  const g = Math.round(100 * (1 - normalized))
  const b = Math.round(150 * (1 - normalized))
  return `rgb(${r}, ${g}, ${b})`
}

function getSoftmaxColor(value) {
  const alpha = Math.max(0.2, value)
  return `rgba(255, 215, 0, ${alpha})`
}

export default function AttentionVisualization({ phrase, currentStep, multiHead }) {
  const tokens = useMemo(() => phrase.split(' ').filter(t => t.length > 0), [phrase])

  const { Q, K, V } = useMemo(() => generateQKV(tokens), [tokens])

  const attentionScores = useMemo(() => computeAttentionScores(tokens), [tokens])

  const scaledScores = useMemo(() => scaleScores(attentionScores), [attentionScores])

  const softmaxWeights = useMemo(() => applySoftmax(scaledScores), [scaledScores])

  // Find min/max for heatmap coloring
  const allScores = attentionScores.flat()
  const minScore = Math.min(...allScores)
  const maxScore = Math.max(...allScores)

  const allScaled = scaledScores.flat()
  const minScaled = Math.min(...allScaled)
  const maxScaled = Math.max(...allScaled)

  return (
    <div className="visualization-container">
      {/* Step 0: Input Tokens */}
      {currentStep >= 0 && (
        <div className="tokens-section animate-slide-in">
          <div className="section-title">Input Tokens → Embeddings</div>
          <div className="tokens-row">
            {tokens.map((token, idx) => (
              <div key={idx} className="token-box">
                <div className={`token ${currentStep === 0 ? 'highlight' : ''}`}>
                  {token}
                </div>
                <div className="embedding-bar">
                  <div
                    className="embedding-fill"
                    style={{ width: currentStep >= 0 ? '100%' : '0%' }}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: '#888' }}>x<sub>{idx + 1}</sub></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: QKV Projection */}
      {currentStep >= 1 && (
        <>
          <div className="arrow-down">↓</div>
          <div className="qkv-section animate-slide-in">
            <div className="matrix-panel query">
              <h3>Query (Q)</h3>
              <div className="matrix-subtitle">"What am I looking for?"</div>
              <div className="matrix-grid">
                {Q.map((row, i) => (
                  <div key={i} className="matrix-row">
                    <span style={{ fontSize: '0.7rem', color: '#60a5fa', marginRight: '5px' }}>
                      {tokens[i].slice(0, 3)}
                    </span>
                    {row.map((val, j) => (
                      <div key={j} className={`matrix-cell query ${currentStep === 1 ? 'highlight' : ''}`}>
                        {val.toFixed(2)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="matrix-panel key">
              <h3>Key (K)</h3>
              <div className="matrix-subtitle">"What do I contain?"</div>
              <div className="matrix-grid">
                {K.map((row, i) => (
                  <div key={i} className="matrix-row">
                    <span style={{ fontSize: '0.7rem', color: '#f472b6', marginRight: '5px' }}>
                      {tokens[i].slice(0, 3)}
                    </span>
                    {row.map((val, j) => (
                      <div key={j} className={`matrix-cell key ${currentStep === 1 ? 'highlight' : ''}`}>
                        {val.toFixed(2)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="matrix-panel value">
              <h3>Value (V)</h3>
              <div className="matrix-subtitle">"What information do I hold?"</div>
              <div className="matrix-grid">
                {V.map((row, i) => (
                  <div key={i} className="matrix-row">
                    <span style={{ fontSize: '0.7rem', color: '#4ade80', marginRight: '5px' }}>
                      {tokens[i].slice(0, 3)}
                    </span>
                    {row.map((val, j) => (
                      <div key={j} className={`matrix-cell value ${currentStep === 1 ? 'highlight' : ''}`}>
                        {val.toFixed(2)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step 2: Attention Scores (QK^T) */}
      {currentStep >= 2 && (
        <>
          <div className="arrow-down">↓</div>
          <div className="attention-section animate-slide-in">
            <div className="section-title">
              Attention Scores (QK<sup>T</sup>) — Query × Key Dot Products
            </div>
            <div className="attention-grid-container">
              <div>
                {/* Column headers (Keys) */}
                <div style={{ display: 'flex', marginLeft: '60px' }}>
                  {tokens.map((token, j) => (
                    <div key={j} className="attention-label" style={{ width: '50px' }}>
                      K: {token.slice(0, 4)}
                    </div>
                  ))}
                </div>
                {/* Rows */}
                {attentionScores.map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="attention-label" style={{ width: '60px', textAlign: 'right', paddingRight: '5px' }}>
                      Q: {tokens[i].slice(0, 4)}
                    </div>
                    {row.map((val, j) => (
                      <div
                        key={j}
                        className="attention-cell"
                        style={{
                          backgroundColor: getHeatmapColor(val, minScore, maxScore),
                          color: val > (maxScore + minScore) / 2 ? '#fff' : '#000'
                        }}
                        title={`Q(${tokens[i]}) · K(${tokens[j]}) = ${val}`}
                      >
                        {val.toFixed(1)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step 3: Scaling */}
      {currentStep >= 3 && (
        <>
          <div className="arrow-down">↓ ÷ √d<sub>k</sub></div>
          <div className="scaling-section animate-slide-in">
            <div className="scaling-formula">
              Scaled Scores = QK<sup>T</sup> / √{D_K} = QK<sup>T</sup> / {SQRT_D_K.toFixed(1)}
            </div>
            <div className="scaling-explanation">
              Scaling prevents dot products from growing too large, which would make softmax too sharp (all attention on one token)
            </div>
            <div className="attention-grid-container" style={{ marginTop: '15px' }}>
              <div>
                {scaledScores.map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="attention-label" style={{ width: '60px', textAlign: 'right', paddingRight: '5px' }}>
                      {tokens[i].slice(0, 4)}
                    </div>
                    {row.map((val, j) => (
                      <div
                        key={j}
                        className="attention-cell"
                        style={{
                          backgroundColor: getHeatmapColor(val, minScaled, maxScaled),
                          color: val > (maxScaled + minScaled) / 2 ? '#fff' : '#000'
                        }}
                      >
                        {val.toFixed(2)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step 4: Softmax */}
      {currentStep >= 4 && (
        <>
          <div className="arrow-down">↓ softmax</div>
          <div className="softmax-section animate-slide-in">
            <div className="section-title">
              Softmax — Normalize Each Row to Sum to 1
            </div>
            <div style={{ marginTop: '15px' }}>
              {softmaxWeights.map((row, i) => (
                <div key={i} className="softmax-row">
                  <div className="softmax-token-label">{tokens[i]}:</div>
                  <div className="softmax-bars">
                    {row.map((val, j) => (
                      <div key={j} className="softmax-bar-container">
                        <div className="softmax-bar">
                          <div
                            className="softmax-fill"
                            style={{ height: `${val * 100}%` }}
                          />
                        </div>
                        <div className="softmax-value">{(val * 100).toFixed(0)}%</div>
                        <div style={{ fontSize: '0.65rem', color: '#666' }}>{tokens[j].slice(0, 3)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.85rem', color: '#888' }}>
              Each row shows how much attention token pays to all other tokens
            </div>
          </div>
        </>
      )}

      {/* Step 5: Output */}
      {currentStep >= 5 && (
        <>
          <div className="arrow-down">↓ × V</div>
          <div className="output-section animate-slide-in">
            <div className="section-title">
              Output — Weighted Sum of Values
            </div>
            <div style={{ textAlign: 'center', margin: '15px 0', fontSize: '0.9rem', color: '#aaa' }}>
              Output<sub>i</sub> = Σ (attention<sub>i,j</sub> × V<sub>j</sub>)
            </div>
            <div className="output-tokens">
              {tokens.map((token, i) => {
                const topAttention = softmaxWeights[i]
                  .map((w, j) => ({ token: tokens[j], weight: w }))
                  .sort((a, b) => b.weight - a.weight)
                  .slice(0, 2)

                return (
                  <div key={i} className="output-token">
                    <div className="output-box">{token}'</div>
                    <div className="context-indicator">
                      Attends to: {topAttention.map(t => `${t.token}(${(t.weight * 100).toFixed(0)}%)`).join(', ')}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#4ade80' }}>
              Each output embedding now contains contextual information from relevant tokens
            </div>
          </div>
        </>
      )}

      {/* Multi-Head Extension - Expanded */}
      {multiHead && currentStep >= 5 && (
        <div className="multihead-expanded animate-slide-in">
          <div className="arrow-down">↓</div>
          <h3 className="multihead-title">Multi-Head Attention</h3>
          <div className="multihead-subtitle">
            Different heads learn different relationship patterns in parallel
          </div>

          {/* Section 1: Head Comparison - Side by Side */}
          <div className="head-comparison-section">
            <div className="section-title">Head Comparison — Different Attention Patterns</div>
            <div className="head-comparison-grid">
              {[
                {
                  name: 'Head 1: Syntactic',
                  description: 'Grammar relationships',
                  examples: ['subject→verb', 'det→noun'],
                  colorHue: 200, // Blue
                  getScore: (from, to, i, j) => {
                    // Syntactic: verbs attend to nouns, nouns to determiners
                    let score = i === j ? 0.3 : 0.05
                    const fromLower = from.toLowerCase()
                    const toLower = to.toLowerCase()
                    const verbs = ['sat', 'is', 'was', 'becomes', 'runs', 'walks']
                    const nouns = ['cat', 'dog', 'home', 'house', 'mat', 'youth']
                    const determiners = ['the', 'a', 'an', 'this', 'that']
                    if (verbs.includes(fromLower) && j < i && (nouns.includes(toLower) || determiners.includes(toLower))) {
                      score += 0.5 + (0.2 / (i - j))
                    }
                    if (nouns.includes(fromLower) && j === i - 1 && determiners.includes(toLower)) {
                      score += 0.6
                    }
                    return Math.min(1, score)
                  }
                },
                {
                  name: 'Head 2: Semantic',
                  description: 'Related concepts',
                  examples: ['noun↔noun', 'similar words'],
                  colorHue: 320, // Pink
                  getScore: (from, to, i, j) => {
                    // Semantic: related words attend to each other
                    let score = i === j ? 0.25 : 0.1
                    const fromLower = from.toLowerCase()
                    const toLower = to.toLowerCase()
                    const livingThings = ['cat', 'dog', 'bird', 'fish', 'person', 'youth']
                    const places = ['home', 'house', 'room', 'place']
                    if (livingThings.includes(fromLower) && livingThings.includes(toLower)) {
                      score += 0.4
                    }
                    if (places.includes(fromLower) && places.includes(toLower)) {
                      score += 0.4
                    }
                    // Add some randomness for realism
                    score += seededRandom(from.charCodeAt(0) * 17 + to.charCodeAt(0) * 31 + 200) * 0.15
                    return Math.min(1, score)
                  }
                },
                {
                  name: 'Head 3: Positional',
                  description: 'Local context',
                  examples: ['nearby tokens', 'adjacency'],
                  colorHue: 120, // Green
                  getScore: (from, to, i, j) => {
                    // Positional: nearby tokens attend strongly (Gaussian-like)
                    const distance = Math.abs(i - j)
                    const score = Math.exp(-distance * distance / 2) * 0.8 + 0.1
                    return Math.min(1, score)
                  }
                }
              ].map((head, headIdx) => {
                // Generate attention matrix for this head
                const headAttention = tokens.map((fromToken, i) =>
                  tokens.map((toToken, j) => head.getScore(fromToken, toToken, i, j))
                )
                // Apply softmax per row
                const headSoftmax = headAttention.map(row => {
                  const maxVal = Math.max(...row)
                  const exps = row.map(v => Math.exp((v - maxVal) * 5)) // Scale for sharper distribution
                  const sum = exps.reduce((a, b) => a + b, 0)
                  return exps.map(v => v / sum)
                })
                // Find top attention pairs
                const topPairs = []
                headSoftmax.forEach((row, i) => {
                  row.forEach((weight, j) => {
                    if (i !== j) {
                      topPairs.push({ from: tokens[i], to: tokens[j], weight })
                    }
                  })
                })
                topPairs.sort((a, b) => b.weight - a.weight)
                const top3 = topPairs.slice(0, 3)

                return (
                  <div key={headIdx} className="head-panel-expanded">
                    <div className="head-header" style={{ borderColor: `hsl(${head.colorHue}, 70%, 50%)` }}>
                      <h4 style={{ color: `hsl(${head.colorHue}, 70%, 60%)` }}>{head.name}</h4>
                      <div className="head-description">{head.description}</div>
                    </div>

                    {/* Heatmap */}
                    <div className="head-heatmap">
                      <div className="heatmap-labels-top">
                        {tokens.map((t, j) => (
                          <div key={j} className="heatmap-label">{t.slice(0, 3)}</div>
                        ))}
                      </div>
                      <div className="heatmap-body">
                        {headSoftmax.map((row, i) => (
                          <div key={i} className="heatmap-row">
                            <div className="heatmap-label-left">{tokens[i].slice(0, 3)}</div>
                            {row.map((val, j) => (
                              <div
                                key={j}
                                className="heatmap-cell"
                                style={{
                                  backgroundColor: `hsla(${head.colorHue}, 70%, 50%, ${val})`,
                                  color: val > 0.4 ? '#fff' : '#888'
                                }}
                                title={`${tokens[i]} → ${tokens[j]}: ${(val * 100).toFixed(0)}%`}
                              >
                                {(val * 100).toFixed(0)}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top attention pairs */}
                    <div className="head-top-pairs">
                      <div className="top-pairs-title">Top Attention:</div>
                      {top3.map((pair, idx) => (
                        <div key={idx} className="top-pair" style={{ color: `hsl(${head.colorHue}, 60%, 70%)` }}>
                          {pair.from}→{pair.to}: {(pair.weight * 100).toFixed(0)}%
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 2: Concatenation & Projection */}
          <div className="concat-section">
            <div className="arrow-down">↓</div>
            <div className="section-title">Concatenation & Output Projection</div>

            <div className="concat-visual">
              <div className="concat-inputs">
                <div className="concat-head-output" style={{ borderColor: 'hsl(200, 70%, 50%)' }}>
                  <div className="head-output-label">Head 1</div>
                  <div className="head-output-dim">[{tokens.length} × d<sub>v</sub>]</div>
                </div>
                <div className="concat-plus">+</div>
                <div className="concat-head-output" style={{ borderColor: 'hsl(320, 70%, 50%)' }}>
                  <div className="head-output-label">Head 2</div>
                  <div className="head-output-dim">[{tokens.length} × d<sub>v</sub>]</div>
                </div>
                <div className="concat-plus">+</div>
                <div className="concat-head-output" style={{ borderColor: 'hsl(120, 70%, 50%)' }}>
                  <div className="head-output-label">Head 3</div>
                  <div className="head-output-dim">[{tokens.length} × d<sub>v</sub>]</div>
                </div>
              </div>

              <div className="arrow-down">↓ Concat</div>

              <div className="concat-result">
                <div className="concat-box">
                  Concat(head<sub>1</sub>, head<sub>2</sub>, head<sub>3</sub>)
                  <div className="concat-dim">[{tokens.length} × 3·d<sub>v</sub>]</div>
                </div>
              </div>

              <div className="arrow-down">↓ × W<sup>O</sup></div>

              <div className="final-output">
                <div className="final-output-box">
                  Multi-Head Output
                  <div className="final-output-dim">[{tokens.length} × d<sub>model</sub>]</div>
                </div>
              </div>
            </div>

            <div className="concat-formula">
              MultiHead(Q, K, V) = Concat(head<sub>1</sub>, ..., head<sub>h</sub>) W<sup>O</sup>
            </div>
          </div>

          {/* Section 3: Pattern Explanation */}
          <div className="pattern-explanation">
            <div className="section-title">Why Multiple Heads?</div>
            <div className="explanation-grid">
              <div className="explanation-item">
                <div className="explanation-icon" style={{ color: 'hsl(200, 70%, 60%)' }}>1</div>
                <div className="explanation-text">
                  <strong>Syntactic Head</strong> learns grammar: verbs find their subjects, nouns find their determiners
                </div>
              </div>
              <div className="explanation-item">
                <div className="explanation-icon" style={{ color: 'hsl(320, 70%, 60%)' }}>2</div>
                <div className="explanation-text">
                  <strong>Semantic Head</strong> learns meaning: related concepts attend to each other regardless of position
                </div>
              </div>
              <div className="explanation-item">
                <div className="explanation-icon" style={{ color: 'hsl(120, 70%, 60%)' }}>3</div>
                <div className="explanation-text">
                  <strong>Positional Head</strong> captures local context: nearby words provide immediate context
                </div>
              </div>
            </div>
            <div className="explanation-summary">
              By combining multiple perspectives, the model builds a richer understanding of each token's context.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
