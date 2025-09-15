"""
Text Tokenizer Service - Core Domain
텍스트 토크나이저 서비스 (한국어/영어 간단 지원)
"""

import re
from typing import List


class TextTokenizerService:
    """간단한 텍스트 토크나이저 서비스"""

    def tokenize(self, text: str) -> List[str]:
        """텍스트를 토큰 리스트로 변환
        - 영문자/숫자: \b\\w+\b 기준 토큰화
        - 한국어: 음절 2-gram 추가
        """
        if not text:
            return []

        tokens = re.findall(r"\b\w+\b", text.lower())

        korean_tokens: List[str] = []
        for token in tokens:
            if any('\u3131' <= ch <= '\u318e' or '\uac00' <=
                   ch <= '\ud7af' for ch in token):
                # 한국어 음절 2-gram 추가
                korean_tokens.extend([token[i:i + 2]
                                     for i in range(max(0, len(token) - 1))])
            korean_tokens.append(token)

        return korean_tokens
