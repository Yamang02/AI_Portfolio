package com.aiportfolio.backend.infrastructure.config;

import com.aiportfolio.backend.infrastructure.persistence.cloudsql.CloudSqlPostgresDataSourceFactory;
import com.aiportfolio.backend.infrastructure.persistence.cloudsql.CloudSqlPostgresEnv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;

/**
 * Builds Cloud SQL PostgreSQL DataSource from split environment variables.
 */
@Slf4j
@Configuration
@Conditional(CloudSqlDataSourceCondition.class)
public class DatabaseConfig {

    @Bean
    @Primary
    public DataSource postgresDataSource(Environment env) {
        String instance = env.getRequiredProperty(CloudSqlPostgresEnv.INSTANCE_CONNECTION_NAME).strip();
        String database = env.getRequiredProperty(CloudSqlPostgresEnv.DATABASE).strip();
        String user = env.getRequiredProperty(CloudSqlPostgresEnv.USER).strip();
        String password = env.getRequiredProperty(CloudSqlPostgresEnv.PASSWORD);

        log.info("Cloud SQL DataSource from env (Java Connector), instance={}", instance);
        return CloudSqlPostgresDataSourceFactory.create(instance, database, user, password);
    }
}