# AI Portfolio RAG Demo - Hexagonal Architecture

🚀 **Interactive RAG (Retrieval-Augmented Generation) demonstration** built with clean hexagonal architecture principles.

## Architecture Overview

This demo showcases a **hexagonal (ports and adapters) architecture** implementation for an AI-powered document processing and question-answering system.

### 🏗️ Architecture Layers

```
src/
├── adapters/          # External interfaces (Primary & Secondary)
│   ├── primary/       # Input adapters (Web API, UI)
│   └── secondary/     # Output adapters (LLM, Vector DB)
├── application/       # Use cases & application services
├── core/             # Domain models & ports (interfaces)
└── infrastructure/   # External service implementations
```

### ✨ Key Features

- **🔄 Clean Architecture**: Hexagonal design with clear separation of concerns
- **📄 Document Processing**: Upload and process various document formats
- **🔍 Semantic Search**: Find relevant content using vector embeddings
- **🤖 RAG Pipeline**: Generate answers using retrieved context
- **🎯 Interactive UI**: Real-time demonstration with Gradio interface

### 🛠️ Tech Stack

- **Framework**: FastAPI + Gradio
- **Architecture**: Hexagonal (Ports & Adapters)
- **AI**: Sentence Transformers for embeddings
- **Vector Store**: In-memory vector database
- **LLM**: Mock implementation (configurable for real LLMs)

### 🚀 Quick Start

1. **Add Documents**: Upload or paste text content
2. **Ask Questions**: Query your documents naturally
3. **View Results**: See relevant sources and generated answers
4. **Explore Architecture**: Check the clean code structure

### 🎮 Try It Out

- Add some sample documents about any topic
- Ask questions like "What is the main concept?" or "Summarize the key points"
- Explore how the RAG pipeline retrieves and processes information

### 💡 Educational Value

This demo illustrates:
- **Hexagonal Architecture** principles in practice
- **Domain-driven design** with clear boundaries
- **Dependency inversion** using ports and adapters
- **Testable code** with mock implementations
- **Scalable structure** for complex AI applications

---

Built with ❤️ using clean architecture principles for maintainable AI applications.