package com.aiportfolio.backend.infrastructure.config;

import com.aiportfolio.backend.infrastructure.persistence.cloudsql.CloudSqlPostgresEnv;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Enables Cloud SQL datasource only when all split Cloud SQL env vars are present.
 */
public final class CloudSqlDataSourceCondition implements Condition {

    private static final String[] REQUIRED_KEYS = {
            CloudSqlPostgresEnv.INSTANCE_CONNECTION_NAME,
            CloudSqlPostgresEnv.DATABASE,
            CloudSqlPostgresEnv.USER,
            CloudSqlPostgresEnv.PASSWORD
    };

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String instance = context.getEnvironment().getProperty(CloudSqlPostgresEnv.INSTANCE_CONNECTION_NAME);
        if (!StringUtils.hasText(instance)) {
            return false;
        }

        List<String> missing = new ArrayList<>();
        for (String key : REQUIRED_KEYS) {
            if (!StringUtils.hasText(context.getEnvironment().getProperty(key))) {
                missing.add(key);
            }
        }

        if (!missing.isEmpty()) {
            throw new IllegalStateException(
                    "Cloud SQL env vars must be set together. Missing: " + String.join(", ", missing));
        }

        return true;
    }
}
