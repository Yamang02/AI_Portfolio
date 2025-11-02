/**
 * Application Layer 공통 유틸리티 패키지
 * 
 * 모든 도메인에서 공통으로 사용되는 유틸리티 클래스들을 포함합니다.
 * 
 * <h3>주요 클래스</h3>
 * <ul>
 *   <li>{@link com.aiportfolio.backend.application.common.util.MetadataHelper MetadataHelper}: 메타데이터 처리</li>
 *   <li>{@link com.aiportfolio.backend.application.common.util.SortOrderHelper SortOrderHelper}: 정렬 순서 관리</li>
 * </ul>
 * 
 * <h3>사용 예시</h3>
 * <pre>
 * // 메타데이터 설정
 * LocalDateTime createdAt = MetadataHelper.setupCreatedAt(entity.getCreatedAt());
 * LocalDateTime updatedAt = MetadataHelper.setupUpdatedAt();
 * 
 * // 정렬 순서 자동 할당
 * Integer sortOrder = SortOrderHelper.assignSortOrder(
 *     entity.getSortOrder(),
 *     allEntities,
 *     Entity::getSortOrder
 * );
 * </pre>
 * 
 * @since 1.0
 */
package com.aiportfolio.backend.application.common.util;

