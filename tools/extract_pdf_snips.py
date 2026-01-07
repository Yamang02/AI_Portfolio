"""
Extract small "before" evidence images from the feedback PDF by searching for
key phrases and clipping around the matched text.

Usage:
  python tools/extract_pdf_snips.py
"""

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path

import fitz  # PyMuPDF


@dataclass(frozen=True)
class SnipSpec:
    out_name: str
    keywords: tuple[str, ...]
    fallback_page: int | None = None  # 0-based


def _union_rect(rects: list[fitz.Rect]) -> fitz.Rect:
    r = rects[0]
    for rr in rects[1:]:
        r |= rr
    return r


def _expand_and_clamp(rect: fitz.Rect, page_rect: fitz.Rect, pad: float) -> fitz.Rect:
    r = fitz.Rect(rect)
    r.x0 -= pad
    r.y0 -= pad
    r.x1 += pad
    r.y1 += pad
    # Clamp to page
    r.x0 = max(page_rect.x0, r.x0)
    r.y0 = max(page_rect.y0, r.y0)
    r.x1 = min(page_rect.x1, r.x1)
    r.y1 = min(page_rect.y1, r.y1)
    return r


def _find_clip_rect(doc: fitz.Document, keywords: tuple[str, ...]) -> tuple[int, fitz.Rect] | None:
    """
    Find first page containing any of the keywords, then compute a clip rect
    around all matches on that page.
    """
    for page_index in range(doc.page_count):
        page = doc.load_page(page_index)
        rects: list[fitz.Rect] = []
        for kw in keywords:
            rects.extend(page.search_for(kw))
        if rects:
            union = _union_rect(rects)
            clip = _expand_and_clamp(union, page.rect, pad=36)  # ~0.5 inch padding
            return page_index, clip
    return None


def _render_clip(page: fitz.Page, clip: fitz.Rect, zoom: float = 2.0) -> fitz.Pixmap:
    mat = fitz.Matrix(zoom, zoom)
    return page.get_pixmap(matrix=mat, clip=clip, alpha=False)


def main() -> int:
    repo_root = Path(__file__).resolve().parents[1]
    base_dir = repo_root / "UIUX_renewal(Portfolio)"
    pdf_path = base_dir / "이정준님 UX_UI 개선 피드백.pdf"
    out_dir = base_dir / "screenshots" / "before" / "pdf"
    out_dir.mkdir(parents=True, exist_ok=True)

    if not pdf_path.exists():
        print(f"[ERR] PDF not found: {pdf_path}", file=sys.stderr)
        return 2

    specs: list[SnipSpec] = [
        SnipSpec(
            out_name="pdf-mainpage-impact.png",
            keywords=("임팩트", "테트리스", "브랜드"),
        ),
        SnipSpec(
            out_name="pdf-stack-buttons.png",
            keywords=("버튼 UI", "액션이 없"),
        ),
        SnipSpec(
            out_name="pdf-bottom-fixed.png",
            keywords=("하단 고정", "상시 고정"),
        ),
        SnipSpec(
            out_name="pdf-filters-hover.png",
            keywords=("검색 필터", "호버", "노션"),
        ),
        SnipSpec(
            out_name="pdf-detail-sidebar.png",
            keywords=("왼쪽", "고정 메뉴", "잘려"),
        ),
        SnipSpec(
            out_name="pdf-ai-assistant.png",
            keywords=("AI", "비서", "컨셉"),
        ),
    ]

    doc = fitz.open(pdf_path)
    written = 0
    for spec in specs:
        found = _find_clip_rect(doc, spec.keywords)
        if not found and spec.fallback_page is not None and 0 <= spec.fallback_page < doc.page_count:
            page = doc.load_page(spec.fallback_page)
            clip = _expand_and_clamp(page.rect, page.rect, pad=0)
            found = (spec.fallback_page, clip)

        if not found:
            print(f"[WARN] No matches for {spec.out_name}: {spec.keywords}")
            continue

        page_index, clip = found
        page = doc.load_page(page_index)
        pix = _render_clip(page, clip, zoom=2.0)
        out_path = out_dir / spec.out_name
        pix.save(out_path.as_posix())
        print(f"[OK] {spec.out_name} (page {page_index + 1}) -> {out_path}")
        written += 1

    print(f"Done. Written {written} file(s) into {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

