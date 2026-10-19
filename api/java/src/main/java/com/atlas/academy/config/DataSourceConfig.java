package com.atlas.academy.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${spring.datasource.url}")
    private String springUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Bean
    public DataSource dataSource() {
        DataSourceBuilder<?> builder = DataSourceBuilder.create();

        if (databaseUrl != null && databaseUrl.startsWith("postgresql://")) {
            // Parse postgresql://user:pass@host:port/db format
            String stripped = databaseUrl.replace("postgresql://", "");
            String[] userAndRest = stripped.split("@", 2);
            if (userAndRest.length < 2) {
                throw new IllegalArgumentException("Malformed DATABASE_URL: missing '@' delimiter. Expected postgresql://user:pass@host:port/db");
            }
            String[] userPass = userAndRest[0].split(":", 2);
            if (userPass.length < 2) {
                throw new IllegalArgumentException("Malformed DATABASE_URL: missing ':' in credentials. Expected postgresql://user:pass@host:port/db");
            }
            String hostPortDb = userAndRest[1];

            builder.url("jdbc:postgresql://" + hostPortDb);
            builder.username(userPass[0]);
            builder.password(userPass[1]);
        } else {
            builder.url(springUrl);
            builder.username(username);
            builder.password(password);
        }

        builder.driverClassName("org.postgresql.Driver");
        return builder.build();
    }
}
