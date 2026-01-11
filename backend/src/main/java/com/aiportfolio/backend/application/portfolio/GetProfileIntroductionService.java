package com.aiportfolio.backend.application.portfolio;

import com.aiportfolio.backend.domain.portfolio.model.ProfileIntroduction;
import com.aiportfolio.backend.domain.portfolio.port.in.GetProfileIntroductionUseCase;
import com.aiportfolio.backend.domain.portfolio.port.out.ProfileIntroductionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 프로필 자기소개 조회 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GetProfileIntroductionService implements GetProfileIntroductionUseCase {

    private final ProfileIntroductionRepositoryPort repository;

    @Override
    public Optional<ProfileIntroduction> getCurrent() {
        return repository.findCurrent();
    }
}
