package com.aiportfolio.backend.infrastructure.persistence.cloudsql;

import org.springframework.boot.jdbc.DataSourceBuilder;

import javax.sql.DataSource;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Cloud SQL for PostgreSQL용 공식 JDBC Socket Factory 기반 {@link DataSource} 생성.
 * <p>
 * 헥사고날 관점에서 애플리케이션·도메인 레이어는 이 타입을 참조하지 않고,
 * Spring이 주입하는 표준 {@link DataSource}만 사용한다. (인프라 어댑터 경계)
 * </p>
 *
 * @see <a href="https://github.com/GoogleCloudPlatform/cloud-sql-jdbc-socket-factory/blob/main/docs/jdbc.md">Cloud SQL JDBC</a>
 */
public final class CloudSqlPostgresDataSourceFactory {

    private static final String SOCKET_FACTORY = "com.google.cloud.sql.postgres.SocketFactory";

    private CloudSqlPostgresDataSourceFactory() {
    }

    /**
     * 문서 권장: {@code jdbc:postgresql:///&lt;DB&gt;?cloudSqlInstance=...&socketFactory=...}
     * Cloud Run 등 서버리스에서는 {@code cloudSqlRefreshStrategy=lazy} 권장.
     */
    public static DataSource create(
            String instanceConnectionName,
            String databaseName,
            String username,
            String password) {
        if (instanceConnectionName == null || instanceConnectionName.isBlank()) {
            throw new IllegalArgumentException("instanceConnectionName is required");
        }
        if (databaseName == null || databaseName.isBlank()) {
            throw new IllegalArgumentException("databaseName is required");
        }

        String jdbcUrl = "jdbc:postgresql:///" + databaseName + "?"
                + "cloudSqlInstance=" + URLEncoder.encode(instanceConnectionName.strip(), StandardCharsets.UTF_8)
                + "&socketFactory=" + URLEncoder.encode(SOCKET_FACTORY, StandardCharsets.UTF_8)
                + "&cloudSqlRefreshStrategy=" + URLEncoder.encode("lazy", StandardCharsets.UTF_8);

        return DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url(jdbcUrl)
                .username(username)
                .password(password)
                .build();
    }
}
