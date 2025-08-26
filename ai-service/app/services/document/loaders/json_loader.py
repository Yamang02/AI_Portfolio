"""JSON document loader for structured QA data and knowledge base content."""

import asyncio
import json
from typing import List, Optional, Dict, Any
from pathlib import Path

from langchain_core.documents import Document

from .base import DocumentLoader


class JsonDocumentLoader(DocumentLoader):
    """JSON document loader for structured knowledge base content."""
    
    def __init__(self, encoding: str = "utf-8"):
        self.encoding = encoding
    
    async def load_document(self, file_path: Path) -> Document:
        """Load a single JSON document.
        
        Args:
            file_path: Path to the JSON file
            
        Returns:
            Loaded document with content and metadata
            
        Raises:
            FileNotFoundError: If file doesn't exist
            PermissionError: If file is not readable
            ValueError: If file format is not supported or JSON is invalid
        """
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if not file_path.is_file():
            raise ValueError(f"Path is not a file: {file_path}")
            
        if file_path.suffix.lower() != '.json':
            raise ValueError(f"File is not a JSON file: {file_path}")
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, 
            self._load_single_file,
            str(file_path)
        )
    
    def _load_single_file(self, file_path: str) -> Document:
        """Synchronous file loading helper."""
        file_path_obj = Path(file_path)
        
        try:
            with open(file_path_obj, 'r', encoding=self.encoding) as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in file {file_path}: {e}")
        except UnicodeDecodeError as e:
            raise ValueError(f"Cannot decode file {file_path} with {self.encoding}: {e}")
        
        # Process different JSON structures
        if isinstance(data, list):
            # Content files (array of QA items)
            content, metadata = self._process_content_array(data, file_path_obj)
        elif isinstance(data, dict):
            # Metadata files or single content items
            content, metadata = self._process_single_object(data, file_path_obj)
        else:
            raise ValueError(f"Unsupported JSON structure in {file_path}")
        
        # Add file metadata
        metadata.update({
            "file_name": file_path_obj.name,
            "file_path": str(file_path_obj.absolute()),
            "file_size": file_path_obj.stat().st_size,
            "file_extension": file_path_obj.suffix,
            "encoding": self.encoding,
            "source_type": "json"
        })
        
        return Document(page_content=content, metadata=metadata)
    
    def _process_content_array(self, data: List[Dict[str, Any]], file_path: Path) -> tuple[str, Dict[str, Any]]:
        """Process JSON array (content files with QA items)."""
        content_parts = []
        metadata = {
            "content_type": "qa_collection",
            "item_count": len(data),
            "categories": set(),
            "tags": set(),
            "items": []
        }
        
        for item in data:
            # Extract content based on type
            if item.get("type") == "qa":
                question = item.get("question", "")
                answer = item.get("answer", "")
                title = item.get("title", "")
                
                # Format as QA pair
                qa_content = f"# {title}\n\n**Q:** {question}\n\n**A:** {answer}\n"
                content_parts.append(qa_content)
                
                # Collect metadata
                if item.get("category"):
                    metadata["categories"].add(item["category"])
                if item.get("tags"):
                    metadata["tags"].update(item["tags"])
                
                # Store item metadata
                metadata["items"].append({
                    "id": item.get("id"),
                    "title": title,
                    "category": item.get("category"),
                    "subcategory": item.get("subcategory"),
                    "priority": item.get("priority", 0),
                    "difficulty": item.get("difficulty"),
                    "tags": item.get("tags", []),
                    "keywords": item.get("keywords", [])
                })
            
            elif item.get("type") in ["documentation", "tutorial", "reference", "example"]:
                title = item.get("title", "")
                content_text = item.get("content", "")
                
                doc_content = f"# {title}\n\n{content_text}\n"
                content_parts.append(doc_content)
                
                # Collect metadata
                if item.get("category"):
                    metadata["categories"].add(item["category"])
                if item.get("tags"):
                    metadata["tags"].update(item["tags"])
                
                metadata["items"].append({
                    "id": item.get("id"),
                    "title": title,
                    "type": item.get("type"),
                    "category": item.get("category"),
                    "subcategory": item.get("subcategory"),
                    "tags": item.get("tags", []),
                    "keywords": item.get("keywords", [])
                })
        
        # Convert sets to lists for JSON serialization
        metadata["categories"] = list(metadata["categories"])
        metadata["tags"] = list(metadata["tags"])
        
        # Join all content
        full_content = "\n---\n\n".join(content_parts)
        
        return full_content, metadata
    
    def _process_single_object(self, data: Dict[str, Any], file_path: Path) -> tuple[str, Dict[str, Any]]:
        """Process single JSON object (metadata files or single content items)."""
        # Check if it's a project metadata file
        if "id" in data and "name" in data and "categories" in data:
            return self._process_project_metadata(data)
        
        # Check if it's a single content item
        elif "type" in data and data["type"] in ["qa", "documentation", "tutorial", "reference", "example"]:
            return self._process_single_content_item(data)
        
        # Generic JSON object
        else:
            content = json.dumps(data, indent=2, ensure_ascii=False)
            metadata = {
                "content_type": "generic_json",
                "object_keys": list(data.keys()) if isinstance(data, dict) else []
            }
            return content, metadata
    
    def _process_project_metadata(self, data: Dict[str, Any]) -> tuple[str, Dict[str, Any]]:
        """Process project metadata JSON."""
        content_parts = [
            f"# {data.get('name', 'Unknown Project')}",
            f"\n**Description:** {data.get('description', '')}",
            f"\n**Domain:** {data.get('domain', '')}",
            f"\n**Version:** {data.get('version', '')}",
        ]
        
        if data.get('tech_stack'):
            tech_stack = ', '.join(data['tech_stack'])
            content_parts.append(f"\n**Technology Stack:** {tech_stack}")
        
        if data.get('contexts'):
            contexts = ', '.join(data['contexts'])
            content_parts.append(f"\n**Contexts:** {contexts}")
        
        if data.get('categories'):
            content_parts.append("\n\n## Categories")
            for category in data['categories']:
                name = category.get('name', '')
                desc = category.get('description', '')
                icon = category.get('icon', '')
                content_parts.append(f"\n- **{icon} {name}**: {desc}")
        
        metadata = {
            "content_type": "project_metadata",
            "project_id": data.get("id"),
            "project_name": data.get("name"),
            "domain": data.get("domain"),
            "tech_stack": data.get("tech_stack", []),
            "contexts": data.get("contexts", []),
            "categories": [cat.get("id") for cat in data.get("categories", [])],
            "created_at": data.get("created_at"),
            "last_updated": data.get("last_updated")
        }
        
        return ''.join(content_parts), metadata
    
    def _process_single_content_item(self, data: Dict[str, Any]) -> tuple[str, Dict[str, Any]]:
        """Process single content item."""
        if data["type"] == "qa":
            title = data.get("title", "")
            question = data.get("question", "")
            answer = data.get("answer", "")
            content = f"# {title}\n\n**Q:** {question}\n\n**A:** {answer}"
        else:
            title = data.get("title", "")
            content_text = data.get("content", "")
            content = f"# {title}\n\n{content_text}"
        
        metadata = {
            "content_type": "single_content_item",
            "item_id": data.get("id"),
            "item_type": data.get("type"),
            "title": data.get("title"),
            "category": data.get("category"),
            "subcategory": data.get("subcategory"),
            "tags": data.get("tags", []),
            "keywords": data.get("keywords", []),
            "difficulty": data.get("difficulty"),
            "priority": data.get("priority", 0),
            "related_content": data.get("related_content", [])
        }
        
        return content, metadata
    
    async def load_documents(self, directory_path: Path, pattern: Optional[str] = None) -> List[Document]:
        """Load multiple JSON documents from directory.
        
        Args:
            directory_path: Path to directory containing documents
            pattern: File pattern to match (defaults to "*.json")
            
        Returns:
            List of loaded documents
            
        Raises:
            FileNotFoundError: If directory doesn't exist
            PermissionError: If directory is not readable
        """
        if not directory_path.exists():
            raise FileNotFoundError(f"Directory not found: {directory_path}")
        
        if not directory_path.is_dir():
            raise ValueError(f"Path is not a directory: {directory_path}")
        
        pattern = pattern or "*.json"
        
        # Find all matching JSON files
        json_files = list(directory_path.glob(pattern))
        
        if not json_files:
            return []
        
        # Load all files concurrently
        tasks = [self.load_document(file_path) for file_path in json_files]
        documents = await asyncio.gather(*tasks)
        
        return documents