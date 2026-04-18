package com.aiportfolio.backend.infrastructure.persistence.cloudsql;

/**
 * Cloud Run + Cloud SQL 연결에 쓰는 환경 변수 이름 (단일 JDBC URL 문자열 사용 안 함).
 */
public final class CloudSqlPostgresEnv {


    public static final String INSTANCE_CONNECTION_NAME = "GCP_CLOUD_SQL_INSTANCE_CONNECTION_NAME";
    public static final String DATABASE = "POSTGRES_DATABASE";
    public static final String USER = "POSTGRES_USER";
    public static final String PASSWORD = "POSTGRES_PASSWORD";

    private CloudSqlPostgresEnv() {
    }
}
