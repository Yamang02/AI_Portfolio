package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.TechStackMetadata;
import com.aiportfolio.backend.domain.portfolio.port.in.UpdateTechStackSortOrderUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.TechStackMetadataRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 기술스택 정렬 순서 업데이트 서비스
 * 정렬 순서 변경 시 자동 재정렬 로직을 구현
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UpdateTechStackSortOrderService implements UpdateTechStackSortOrderUseCase {
    
    private final TechStackMetadataRepositoryPort techStackMetadataRepositoryPort;
    
    @Override
    public List<TechStackMetadata> updateSortOrder(String techStackName, int newSortOrder) {
        log.info("기술스택 '{}'의 정렬 순서를 {}로 변경", techStackName, newSortOrder);
        
        // 모든 기술스택 조회
        List<TechStackMetadata> allTechStacks = techStackMetadataRepositoryPort.findAll();
        
        // 변경할 기술스택 찾기
        TechStackMetadata targetTech = allTechStacks.stream()
            .filter(tech -> tech.getName().equals(techStackName))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("기술스택을 찾을 수 없습니다: " + techStackName));
        
        int oldSortOrder = targetTech.getSortOrder();
        
        // 정렬 순서가 변경되지 않은 경우
        if (oldSortOrder == newSortOrder) {
            log.info("정렬 순서가 동일하므로 변경하지 않습니다");
            return allTechStacks;
        }
        
        // 자동 재정렬 로직 실행
        List<TechStackMetadata> reorderedTechStacks = reorderTechStacks(allTechStacks, techStackName, oldSortOrder, newSortOrder);
        
        // 데이터베이스에 저장
        List<TechStackMetadata> savedTechStacks = techStackMetadataRepositoryPort.saveAll(reorderedTechStacks);
        
        log.info("정렬 순서 업데이트 완료: {}개 항목", savedTechStacks.size());
        return savedTechStacks;
    }
    
    @Override
    public List<TechStackMetadata> updateSortOrders(List<SortOrderUpdate> sortOrderUpdates) {
        log.info("{}개 기술스택의 정렬 순서 일괄 업데이트", sortOrderUpdates.size());
        
        // 모든 기술스택 조회
        List<TechStackMetadata> allTechStacks = techStackMetadataRepositoryPort.findAll();
        
        // 업데이트 정보를 Map으로 변환
        Map<String, Integer> updateMap = sortOrderUpdates.stream()
            .collect(Collectors.toMap(
                SortOrderUpdate::getTechStackName,
                SortOrderUpdate::getNewSortOrder
            ));
        
        // 각 기술스택의 정렬 순서 업데이트
        List<TechStackMetadata> updatedTechStacks = new ArrayList<>();
        
        for (TechStackMetadata tech : allTechStacks) {
            if (updateMap.containsKey(tech.getName())) {
                int newSortOrder = updateMap.get(tech.getName());
                int oldSortOrder = tech.getSortOrder();
                
                if (oldSortOrder != newSortOrder) {
                    // 정렬 순서 변경이 필요한 경우
                    List<TechStackMetadata> reordered = reorderTechStacks(
                        allTechStacks, tech.getName(), oldSortOrder, newSortOrder
                    );
                    updatedTechStacks.addAll(reordered);
                }
            }
        }
        
        // 데이터베이스에 저장
        List<TechStackMetadata> savedTechStacks = techStackMetadataRepositoryPort.saveAll(updatedTechStacks);
        
        log.info("일괄 정렬 순서 업데이트 완료: {}개 항목", savedTechStacks.size());
        return savedTechStacks;
    }
    
    /**
     * 기술스택들을 자동 재정렬
     * 
     * @param allTechStacks 모든 기술스택 목록
     * @param targetTechName 변경할 기술스택 이름
     * @param oldSortOrder 기존 정렬 순서
     * @param newSortOrder 새로운 정렬 순서
     * @return 재정렬된 기술스택 목록
     */
    private List<TechStackMetadata> reorderTechStacks(
            List<TechStackMetadata> allTechStacks, 
            String targetTechName, 
            int oldSortOrder, 
            int newSortOrder) {
        
        List<TechStackMetadata> result = new ArrayList<>();
        
        if (oldSortOrder < newSortOrder) {
            // 뒤로 이동하는 경우 (예: 3번 → 7번)
            // 3번을 7번으로 이동하고, 4,5,6,7번을 3,4,5,6번으로 이동
            
            for (TechStackMetadata tech : allTechStacks) {
                if (tech.getName().equals(targetTechName)) {
                    // 대상 기술스택을 새로운 위치로 이동
                    result.add(createUpdatedTechStack(tech, newSortOrder));
                } else if (tech.getSortOrder() > oldSortOrder && tech.getSortOrder() <= newSortOrder) {
                    // 기존 4,5,6,7번을 3,4,5,6번으로 이동
                    result.add(createUpdatedTechStack(tech, tech.getSortOrder() - 1));
                } else {
                    // 나머지는 그대로 유지
                    result.add(tech);
                }
            }
            
        } else {
            // 앞으로 이동하는 경우 (예: 7번 → 3번)
            // 7번을 3번으로 이동하고, 3,4,5,6번을 4,5,6,7번으로 이동
            
            for (TechStackMetadata tech : allTechStacks) {
                if (tech.getName().equals(targetTechName)) {
                    // 대상 기술스택을 새로운 위치로 이동
                    result.add(createUpdatedTechStack(tech, newSortOrder));
                } else if (tech.getSortOrder() >= newSortOrder && tech.getSortOrder() < oldSortOrder) {
                    // 기존 3,4,5,6번을 4,5,6,7번으로 이동
                    result.add(createUpdatedTechStack(tech, tech.getSortOrder() + 1));
                } else {
                    // 나머지는 그대로 유지
                    result.add(tech);
                }
            }
        }
        
        return result;
    }
    
    /**
     * 업데이트된 기술스택 객체 생성
     */
    private TechStackMetadata createUpdatedTechStack(TechStackMetadata original, int newSortOrder) {
        return TechStackMetadata.builder()
            .name(original.getName())
            .displayName(original.getDisplayName())
            .category(original.getCategory())
            .level(original.getLevel())
            .isCore(original.getIsCore())
            .isActive(original.getIsActive())
            .iconUrl(original.getIconUrl())
            .colorHex(original.getColorHex())
            .description(original.getDescription())
            .sortOrder(newSortOrder)
            .createdAt(original.getCreatedAt())
            .updatedAt(LocalDateTime.now())
            .build();
    }
}
