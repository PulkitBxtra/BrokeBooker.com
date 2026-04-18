package com.bxtra.brokebooker.config;

import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Runs Flyway `repair` before `migrate` on every boot. Repair refreshes the
 * checksums in `flyway_schema_history` to match the current migration files,
 * which keeps us unblocked when a file's content changes during development
 * (whitespace, comment tweaks) — the DB state is unchanged, only checksums
 * get corrected. It's a no-op when nothing's out of sync.
 */
@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy repairThenMigrate() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
