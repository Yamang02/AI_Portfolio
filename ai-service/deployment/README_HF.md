---
title: AI Portfolio RAG Demo - Hexagonal Architecture
emoji: 🌌
colorFrom: purple
colorTo: blue
sdk: gradio
sdk_version: 5.44.0
app_file: demo.py
pinned: false
---

# 🚀 AI Portfolio RAG Demo
## Hexagonal Architecture Implementation

This interactive demo showcases a **Retrieval-Augmented Generation (RAG)** system built with clean **hexagonal architecture** principles.

### 🎯 How to Use:
1. **📚 Load Sample Data** to automatically add AI Portfolio project documents
2. **📄 Add Documents** to build additional knowledge base
3. **🔍 Search** for relevant content (sample queries provided)
4. **🤖 Ask Questions** to get AI-generated answers
5. **🔬 Analyze** to see detailed processing steps
6. **📊 Explore** the clean architecture structure

### 🔬 New Features:
- **📚 Auto Sample Data**: AI Portfolio project documents automatically available
- **💡 Sample Queries**: Pre-defined questions for easy testing
- **🔍 Document Analysis**: See how documents are chunked and vectorized
- **⚡ Search Analysis**: Understand the vector search process step by step
- **📈 Processing Metrics**: Real-time performance analysis
- **🔢 Vector Insights**: Detailed information about embeddings and similarity

### 📚 Sample Data Included:
- **AI Portfolio Overview**: Project goals and technical decisions (simplified)
- **Architecture Q&A**: Hexagonal architecture implementation details
- **RAG System Q&A**: RAG system and vector processing explanations

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
