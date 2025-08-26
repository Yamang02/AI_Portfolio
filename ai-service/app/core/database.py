"""
Database connection and session management
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from contextlib import asynccontextmanager
from typing import AsyncGenerator
import logging

from .config import get_config_manager

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Database connection manager"""
    
    def __init__(self):
        self.config = get_config_manager()
        self.engine = None
        self.session_factory = None
        
    async def initialize(self):
        """Initialize database connection"""
        try:
            db_config = self.config.get_database_config()
            
            # Create async engine
            self.engine = create_async_engine(
                db_config['url'],
                echo=False,  # Set to True for SQL debugging
                pool_size=db_config.get('pool_size', 10),
                max_overflow=db_config.get('max_overflow', 20),
                pool_timeout=db_config.get('pool_timeout', 30),
                pool_recycle=db_config.get('pool_recycle', 3600),
                poolclass=NullPool if "sqlite" in db_config['url'] else None,
            )
            
            # Create session factory
            self.session_factory = async_sessionmaker(
                bind=self.engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            # Test connection
            async with self.get_session() as session:
                await session.execute("SELECT 1")
                
            logger.info("✅ Database connection initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise
    
    @asynccontextmanager
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get database session with automatic cleanup"""
        if not self.session_factory:
            raise RuntimeError("Database not initialized. Call initialize() first.")
        
        async with self.session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()
    
    async def close(self):
        """Close database connection"""
        if self.engine:
            await self.engine.dispose()
            logger.info("✅ Database connection closed")


# Global database manager instance
db_manager = DatabaseManager()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency function for FastAPI"""
    async with db_manager.get_session() as session:
        yield session


async def init_database():
    """Initialize database - called at startup"""
    await db_manager.initialize()


async def close_database():
    """Close database - called at shutdown"""
    await db_manager.close()