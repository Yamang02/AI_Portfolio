---
title: AI Portfolio RAG Demo - Hexagonal Architecture
emoji: 🌌
colorFrom: violet
colorTo: fuchsia
sdk: gradio
sdk_version: 5.44.0
app_file: demo.py
pinned: false
---

# 🚀 AI Portfolio RAG Demo
## Hexagonal Architecture Implementation

This interactive demo showcases a **Retrieval-Augmented Generation (RAG)** system built with clean **hexagonal architecture** principles.

### 🎯 How to Use:
1. **Add Documents** to build your knowledge base
2. **Analyze Documents** to see detailed processing steps
3. **Search** for relevant content
4. **Analyze Search** to understand vector processing
5. **Ask Questions** to get AI-generated answers
6. **Explore** the clean architecture structure

### 🔬 New Features:
- **Document Analysis**: See how documents are chunked and vectorized
- **Search Analysis**: Understand the vector search process step by step
- **Processing Metrics**: Real-time performance analysis
- **Vector Insights**: Detailed information about embeddings and similarity

### 🏗️ Architecture Info

**Hexagonal Architecture Layers:**
- **Adapters**: External interfaces (Web, LLM, Vector DB)
- **Application**: Business logic & use cases  
- **Core**: Domain models & ports
- **Infrastructure**: External service implementations

**Benefits:**
- ✅ Clean separation of concerns
- ✅ Testable with mock adapters
- ✅ Easy to swap implementations
- ✅ Maintainable & scalable

### 🛠️ Technical Stack
- **Backend**: Python 3.11, FastAPI
- **Vector Processing**: TF-IDF, scikit-learn
- **UI**: Gradio
- **Architecture**: Hexagonal (Ports & Adapters)

### 📚 Features
- **Document Processing**: Automatic chunking and vectorization
- **Vector Search**: TF-IDF based similarity search
- **RAG Pipeline**: Retrieval-Augmented Generation
- **Real-time Analysis**: Step-by-step processing visualization
- **Performance Metrics**: Processing time and efficiency analysis

---

*Built with ❤️ using Hexagonal Architecture principles*
