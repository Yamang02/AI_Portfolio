---
title: RAG Pipeline Demo
emoji: 🤖
colorFrom: blue
colorTo: green
sdk: docker
app_file: hf_spaces_app.py
pinned: false
license: mit
---

# 🤖 RAG Pipeline Demonstration

Interactive demonstration of **Retrieval-Augmented Generation (RAG)** pipeline with real vector search capabilities.

## 🎯 Features

### 📄 **Document Upload & Processing**
- Upload `.txt` or `.md` files
- Real-time document processing with LangChain
- Automatic text chunking
- Live embedding generation with sentence-transformers

### 🔍 **Vector Similarity Search**
- Semantic similarity search using cosine similarity
- Configurable top-k results
- Real-time similarity scores
- Performance metrics and timing

### 🧮 **Embedding Generation**
- Live text embedding generation
- Similarity calculation between any two texts
- Embedding statistics and analysis
- Model: `paraphrase-multilingual-MiniLM-L12-v2`

### 🤖 **RAG-based Response Generation**  
- End-to-end RAG pipeline demonstration
- Context retrieval from uploaded documents
- Response generation with retrieved context
- Source document tracking and citations

### 🗄️ **Vector Store Management**
- Session-based in-memory vector storage
- Storage statistics and monitoring
- Data management (clear, refresh)
- Memory usage tracking

## 🛠 Technical Stack

- **Frontend**: Gradio 5.44.0 (Interactive UI)
- **Backend**: FastAPI (REST API)
- **Embeddings**: sentence-transformers (Local model)
- **Vector Search**: Cosine similarity with scikit-learn
- **Text Processing**: LangChain text splitters
- **Storage**: In-memory vector store (session-based)

## 🚀 Getting Started

1. **Upload a document** using the "Document Upload & Processing" tab
2. **Search for content** using semantic queries in the "Vector Search" tab  
3. **Compare text similarity** in the "Embedding Generation" tab
4. **Generate RAG responses** in the "RAG Generation" tab
5. **Manage your vector store** in the "Vector Store Management" tab

## 📊 Example Queries

Try these sample queries after uploading your documents:

- `"machine learning project"` - Find ML-related content
- `"database design"` - Find database-related information  
- `"user interface development"` - Find UI/UX content
- `"API implementation"` - Find API development details
- `"project architecture"` - Find system design information

## 🔧 Architecture

This demo showcases a complete RAG pipeline:

```
Document → Chunking → Embedding → Vector Store → Search → Context → Response
```

Each step is demonstrated interactively with real-time processing and metrics.

## 📝 Educational Value

Perfect for:
- **Learning RAG concepts** through hands-on experience
- **Understanding vector similarity** with real embeddings
- **Comparing different chunking strategies** 
- **Exploring embedding model capabilities**
- **Prototyping RAG applications**

## 🌟 Live Demo

Experience the full RAG pipeline with your own documents and see how retrieval-augmented generation works in practice!

---

**Built with ❤️ using Gradio, LangChain, and sentence-transformers**