package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.ProfileIntroduction;
import com.aiportfolio.backend.domain.portfolio.port.in.ManageProfileIntroductionUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.ProfileIntroductionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 프로필 자기소개 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ManageProfileIntroductionService implements ManageProfileIntroductionUseCase {

    private final ProfileIntroductionRepositoryPort repository;

    @Override
    public ProfileIntroduction saveOrUpdate(SaveProfileIntroductionCommand command) {
        // 기존 자기소개 조회
        return repository.findCurrent()
                .map(existing -> {
                    // 업데이트
                    ProfileIntroduction updated = existing.updateContent(command.content());
                    updated.validate();
                    return repository.save(updated);
                })
                .orElseGet(() -> {
                    // 신규 생성
                    ProfileIntroduction newIntro = ProfileIntroduction.builder()
                            .content(command.content())
                            .version(1)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    newIntro.validate();
                    return repository.save(newIntro);
                });
    }
}
