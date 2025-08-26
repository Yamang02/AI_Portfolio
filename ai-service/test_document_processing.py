#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test script for document processing pipeline."""

import asyncio
import sys
import json
import os
from pathlib import Path
from typing import Dict, Any

# Set UTF-8 encoding for Windows console
if os.name == 'nt':
    sys.stdout.reconfigure(encoding='utf-8')

# Add the app directory to the path so we can import modules
sys.path.append(str(Path(__file__).parent / "app"))

from app.core.config import get_config_manager
from app.services.document import DocumentProcessingPipeline


async def test_document_processing():
    """Test the complete document processing pipeline."""
    print("=== Document Processing Pipeline Test ===\n")
    
    # Load configuration
    config_manager = get_config_manager()
    doc_config = config_manager.internal.get('document_processing', {})
    
    print(f"Configuration loaded:")
    print(f"  - Source directory: {doc_config.get('source_directory', 'Not set')}")
    print(f"  - File pattern: {doc_config.get('file_pattern', 'Not set')}")
    print(f"  - Chunk size: {doc_config.get('splitter', {}).get('chunk_size', 'Not set')}")
    print(f"  - Validation enabled: {doc_config.get('enable_validation', 'Not set')}")
    print()
    
    # Initialize pipeline
    pipeline = DocumentProcessingPipeline(config=doc_config)
    
    # Test with the actual knowledge base
    knowledge_base_path = Path("../knowledge-base/projects/ai-portfolio")
    
    print(f"Testing with knowledge base: {knowledge_base_path.absolute()}")
    
    if not knowledge_base_path.exists():
        print(f"[WARNING] Knowledge base directory {knowledge_base_path} does not exist")
        print("   Falling back to docs/projects...")
        
        # Fallback to docs/projects
        docs_path = Path("docs/projects/")
        if not docs_path.exists():
            print(f"[ERROR] Fallback directory {docs_path} also does not exist")
            print("   Creating test directory structure...")
            docs_path.mkdir(parents=True, exist_ok=True)
        
        # Create a simple test markdown file
            test_file = docs_path / "test_project.md"
            test_content = """# Test Project

## Overview
This is a test project for demonstrating the document processing pipeline.

## Features
- Feature 1: Basic functionality
- Feature 2: Advanced processing
- Feature 3: Error handling

### Technical Details
The project uses various technologies:

#### Backend
- Python for AI processing
- FastAPI for web framework

#### Frontend  
- React for user interface
- TypeScript for type safety

## Implementation
The implementation follows best practices:

1. Clean architecture
2. Comprehensive testing
3. Proper documentation

## Results
The project achieved its objectives and provides a solid foundation for future development.
"""
            test_file.write_text(test_content, encoding='utf-8')
            print(f"   Created test file: {test_file}")
            test_path = docs_path
        else:
            test_path = docs_path
        print()
    else:
        test_path = knowledge_base_path
        print(f"   Found knowledge base with contents:")
        for item in test_path.iterdir():
            print(f"   - {item.name}")
        print()
    
    try:
        # Process the directory - support both JSON and MD files
        print("[PROCESSING] Processing documents...")
        if test_path.name == "ai-portfolio":
            # Knowledge base structure: process content directory
            content_path = test_path / "content"
            if content_path.exists():
                result = await pipeline.process_directory(content_path, "*.json")
            else:
                result = await pipeline.process_directory(test_path, "*")
        else:
            # Regular docs directory
            result = await pipeline.process_directory(test_path, "*")
        
        print("[SUCCESS] Processing completed successfully!\n")
        
        # Display results
        print_processing_results(result)
        
        # Test single file processing if test file exists
        test_file = docs_path / "test_project.md"
        if test_file.exists():
            print("\n" + "="*50)
            print("Testing single file processing...")
            single_result = await pipeline.process_file(test_file)
            print("\n📄 Single File Results:")
            print_processing_results(single_result, detailed=False)
        
        # Test batch processing
        print("\n" + "="*50)
        print("Testing batch processing...")
        
        # Find all markdown files
        md_files = list(docs_path.glob("*.md"))
        if md_files:
            batch_results = await pipeline.process_batch(md_files[:3], max_concurrent=2)  # Test with first 3 files
            summary = pipeline.get_processing_summary(batch_results)
            
            print("\n📊 Batch Processing Summary:")
            print(f"  - Total processed: {summary['total_processed']}")
            print(f"  - Successful: {summary['successful']}")
            print(f"  - Failed: {summary['failed']}")
            print(f"  - Total documents: {summary['documents']['total']}")
            print(f"  - Total chunks: {summary['chunks']['total']}")
            print(f"  - Avg chunks per document: {summary['chunks']['avg_per_document']:.1f}")
            print(f"  - Processing time: {summary['performance']['total_processing_time']:.2f}s")
            print(f"  - Documents per second: {summary['performance']['documents_per_second']:.1f}")
            
            if summary['validation']['errors'] > 0:
                print(f"  ⚠️ Validation errors: {summary['validation']['errors']}")
            if summary['validation']['warnings'] > 0:
                print(f"  ⚠️ Validation warnings: {summary['validation']['warnings']}")
    
    except Exception as e:
        print(f"[ERROR] Error during processing: {e}")
        import traceback
        traceback.print_exc()


def print_processing_results(result: Dict[str, Any], detailed: bool = True):
    """Print processing results in a readable format."""
    print("[RESULTS] Processing Results:")
    print(f"  - Source: {result['source_path']}")
    print(f"  - Documents loaded: {result['processing_stats']['document_count']}")
    print(f"  - Chunks generated: {result['processing_stats']['chunk_count']}")
    print(f"  - Total content length: {result['processing_stats']['total_content_length']:,} chars")
    print(f"  - Processing time: {result['processing_stats']['processing_time']:.2f}s")
    
    if result.get('error'):
        print(f"  [ERROR]: {result['error']}")
        return
    
    if not detailed:
        return
    
    # Show document details
    if result['documents']:
        print(f"\n[DOCUMENTS] Document Details:")
        for i, doc in enumerate(result['documents'][:3]):  # Show first 3
            metadata = doc.metadata
            print(f"  Document {i+1}:")
            print(f"    - File: {metadata.get('file_name', 'Unknown')}")
            print(f"    - Size: {metadata.get('file_size', 0):,} bytes")
            print(f"    - Content length: {len(doc.page_content):,} chars")
        
        if len(result['documents']) > 3:
            print(f"    ... and {len(result['documents']) - 3} more documents")
    
    # Show chunk details
    if result['chunks']:
        print(f"\n🔧 Chunk Details:")
        chunk_sizes = [len(chunk) for chunk in result['chunks']]
        print(f"  - Chunk count: {len(result['chunks'])}")
        print(f"  - Size range: {min(chunk_sizes)}-{max(chunk_sizes)} chars")
        print(f"  - Average size: {sum(chunk_sizes)/len(chunk_sizes):.0f} chars")
        
        # Show first few chunks
        for i, chunk in enumerate(result['chunks'][:2]):  # Show first 2
            print(f"  \nChunk {i+1} ({len(chunk)} chars):")
            preview = chunk.content[:100].replace('\n', ' ')
            print(f"    Preview: {preview}{'...' if len(chunk.content) > 100 else ''}")
            print(f"    Metadata: {chunk.metadata.get('split_method', 'unknown')} split")
    
    # Show validation results
    if result.get('validation_result'):
        print(f"\n🔍 Validation Results:")
        validation = result['validation_result']
        print(f"  - Status: {validation.status.value.upper()}")
        print(f"  - Total issues: {len(validation.issues)}")
        
        # Count by type
        errors = sum(1 for issue in validation.issues if issue.level.value == 'error')
        warnings = sum(1 for issue in validation.issues if issue.level.value == 'warning')
        info = sum(1 for issue in validation.issues if issue.level.value == 'pass')
        
        if errors > 0:
            print(f"  - ❌ Errors: {errors}")
        if warnings > 0:
            print(f"  - ⚠️ Warnings: {warnings}")
        if info > 0:
            print(f"  - ℹ️ Info: {info}")
        
        # Show some validation issues
        error_issues = [issue for issue in validation.issues if issue.level.value == 'error']
        warning_issues = [issue for issue in validation.issues if issue.level.value == 'warning']
        
        if error_issues:
            print(f"\n  🚨 Error Details:")
            for issue in error_issues[:3]:  # Show first 3 errors
                print(f"    - {issue.message}")
                if issue.suggestion:
                    print(f"      💡 {issue.suggestion}")
        
        if warning_issues:
            print(f"\n  ⚠️ Warning Details:")
            for issue in warning_issues[:3]:  # Show first 3 warnings
                print(f"    - {issue.message}")
                if issue.suggestion:
                    print(f"      💡 {issue.suggestion}")


if __name__ == "__main__":
    # Run the test
    asyncio.run(test_document_processing())