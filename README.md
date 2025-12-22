# Stanford CME 295: Transformers and LLMs Visualization

Interactive visualizations for understanding Transformers and Large Language Models, created for Stanford's CME 295 course.

## Overview

This project provides beginner-friendly, interactive visualizations that demonstrate how different NLP architectures process text. By comparing architectures side-by-side and exploring the mechanics of attention, learners can develop intuition for the evolution of sequence modeling in NLP.

## Visualizations

### 1. Architecture Comparison Demo

An interactive side-by-side comparison showing how five different architectures process the phrase:

> *"Number 67 suddenly becomes popular among the youth"*

| Architecture | What You'll See |
|-------------|-----------------|
| **RNN** | Sequential token-by-token processing with hidden state flow, cell diagram, and memory decay visualization |
| **LSTM** | Gate mechanisms (forget, input, output) with percentages, cell state highway, and level indicator |
| **Word2Vec** | Static word embeddings in 2D semantic space with semantic groupings |
| **Transformer** | Parallel self-attention with attention weight visualization |
| **LLM** | Multi-layer transformer stack (6 layers) with next-token prediction |

**Key Learning Points:**
- Why sequential models struggle with long-range dependencies
- How attention enables parallel processing and direct token connections
- The difference between static embeddings and contextual representations

### 2. Attention Mechanism Visualization

A step-by-step breakdown of the attention formula:

> **softmax(QK^T / sqrt(d_k)) V**

| Step | What You'll See |
|------|-----------------|
| **Input Tokens** | Words converted to embedding vectors |
| **Q, K, V Projection** | Query, Key, Value matrices with intuitive labels |
| **Attention Scores** | Interactive heatmap of QK^T dot products |
| **Scaling** | Division by sqrt(d_k) with explanation |
| **Softmax** | Animated normalization with bar charts |
| **Output** | Weighted sum showing contextualized embeddings |

**Features:**
- Multi-head attention toggle showing different attention patterns
- Custom input phrase support
- Step-through animation with play/pause

## Technology Stack

- **Frontend:** JavaScript, React, D3.js
- **Build Tool:** Vite
- **Visualization:** SVG animations, interactive components
- **Data:** Simulated/pre-computed for fast loading

## Project Structure

```
Stanford-CME295-Transformers-and-LLMs-visualization/
├── README.md
├── LICENSE
├── package.json
├── vite.config.js
├── .gitignore
│
├── lecture 1 architecture visualization/
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── components/
│   │       ├── RNNVisualization.jsx
│   │       ├── LSTMVisualization.jsx
│   │       ├── Word2VecVisualization.jsx
│   │       ├── TransformerVisualization.jsx
│   │       └── LLMVisualization.jsx
│   └── styles/
│       └── main.css
│
└── lecture 1 attention mechanism/
    ├── index.html
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── components/
    │       └── AttentionVisualization.jsx
    └── styles/
        └── main.css
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Stanford-CME295-Transformers-and-LLMs-visualization.git

# Navigate to the project directory
cd Stanford-CME295-Transformers-and-LLMs-visualization

# Install dependencies
npm install
```

### Running Visualizations

```bash
# Run the Architecture Comparison visualization
npm run dev:architecture

# Run the Attention Mechanism visualization
npm run dev:attention
```

Open your browser and navigate to `http://localhost:5173` to view the interactive visualizations.

### Building for Production

```bash
# Build all visualizations
npm run build

# Build individual visualizations
npm run build:architecture
npm run build:attention
```

## Educational Goals

- **Beginner-friendly:** Clear labels, tooltips, and step-by-step explanations
- **Interactive:** Step through processing animations at your own pace
- **Comparative:** Understand differences through direct side-by-side comparison
- **Accurate:** Faithful representations of how each architecture actually works

## Contributing

Contributions are welcome! If you'd like to add new visualizations or improve existing ones:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-visualization`)
3. Commit your changes (`git commit -m 'Add new visualization'`)
4. Push to the branch (`git push origin feature/new-visualization`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Stanford CME 295: Transformers and Large Language Models
- Inspired by the need to make complex architectures accessible to beginners
