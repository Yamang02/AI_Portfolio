/**
 * Application Layer 공통 컴포넌트
 *
 * <h2>주요 클래스</h2>
 * <ul>
 *   <li>{@link com.aiportfolio.backend.application.common.BaseCrudService} - 기본 CRUD 서비스 추상 클래스</li>
 *   <li>{@link com.aiportfolio.backend.application.common.BaseRepositoryPort} - 기본 Repository Port 인터페이스</li>
 * </ul>
 *
 * <h2>사용 예시</h2>
 * <pre>{@code
 * @Service
 * public class ManageEducationService
 *     extends BaseCrudService<Education, String>
 *     implements ManageEducationUseCase {
 *
 *     // 필수 메서드만 구현
 *     @Override
 *     protected BaseRepositoryPort<Education, String> getRepository() {
 *         return educationRepositoryAdapter;
 *     }
 *
 *     @Override
 *     protected String getEntityName() {
 *         return "Education";
 *     }
 * }
 * }</pre>
 *
 * @since 1.0
 * @see com.aiportfolio.backend.application.common.BaseCrudService
 */
package com.aiportfolio.backend.application.common;
