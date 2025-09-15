-- RAG (Retrieval-Augmented Generation) support tables
-- These tables prepare for future vector database integration with Qdrant

-- 문서 임베딩 메타데이터 테이블
CREATE TABLE document_embeddings (
    id SERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_id INTEGER NOT NULL,
    content_text TEXT NOT NULL,
    embedding_model VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_document_embeddings_content ON document_embeddings(content_type, content_id);
CREATE INDEX idx_document_embeddings_model ON document_embeddings(embedding_model);
CREATE INDEX idx_document_embeddings_metadata ON document_embeddings USING GIN(metadata);