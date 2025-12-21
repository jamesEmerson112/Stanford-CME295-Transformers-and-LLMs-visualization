# Stanford CME 295: Transformers and LLMs Visualization

Interactive visualizations for understanding Transformers and Large Language Models, created for Stanford's CME 295 course.

## Overview

This project provides beginner-friendly, interactive visualizations that demonstrate how different NLP architectures process text. By comparing side-by-side how RNNs, LSTMs, Word2Vec, Transformers, and LLMs handle the same input phrase, learners can develop intuition for the evolution of sequence modeling in NLP.

## Visualizations

### 1. Architecture Comparison Demo

An interactive side-by-side comparison showing how five different architectures process the phrase:

> *"The cat sat on the mat because it was tired"*

| Architecture | What You'll See |
|-------------|-----------------|
| **RNN** | Sequential token-by-token processing with hidden state flow, demonstrating vanishing gradient issues |
| **LSTM** | Gate mechanisms (forget, input, output) and cell state highway preserving long-term memory |
| **Word2Vec** | Static word embeddings without sequence awareness |
| **Transformer** | Parallel self-attention with attention weight visualization showing "it" attending to "cat" |
| **LLM** | Multi-layer transformer stack with next-token prediction |

**Key Learning Points:**
- Why sequential models struggle with long-range dependencies
- How attention enables parallel processing and direct token connections
- The difference between static embeddings and contextual representations

## Technology Stack

- **Frontend:** JavaScript, React, D3.js
- **Visualization:** SVG animations, interactive components
- **Data:** Simulated/pre-computed for fast loading

## Project Structure

```
Stanford-CME295-Transformers-and-LLMs-visualization/
├── README.md
├── LICENSE
├── visualizations/
│   └── architecture-comparison/
│       ├── index.html
│       ├── src/
│       │   ├── App.jsx
│       │   ├── components/
│       │   │   ├── RNNVisualization.jsx
│       │   │   ├── LSTMVisualization.jsx
│       │   │   ├── Word2VecVisualization.jsx
│       │   │   ├── TransformerVisualization.jsx
│       │   │   └── LLMVisualization.jsx
│       │   └── utils/
│       └── styles/
├── assets/
│   └── images/
└── package.json
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

# Start the development server
npm run dev
```

### Running Visualizations

Open your browser and navigate to `http://localhost:3000` to view the interactive visualizations.

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
