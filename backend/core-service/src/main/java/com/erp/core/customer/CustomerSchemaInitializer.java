package com.erp.core.customer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Keeps the customers table aligned with the tenant-scoped email rule.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CustomerSchemaInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        dropSingleColumnEmailUniqueConstraint();
        ensureTenantScopedEmailUniqueness();
    }

    private void dropSingleColumnEmailUniqueConstraint() {
        String constraintName = jdbcTemplate.query(
                """
                SELECT c.conname
                FROM pg_constraint c
                JOIN pg_class t ON c.conrelid = t.oid
                JOIN unnest(c.conkey) AS cols(attnum) ON TRUE
                JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = cols.attnum
                WHERE t.relname = 'customers' AND c.contype = 'u'
                GROUP BY c.conname
                HAVING COUNT(*) = 1 AND MIN(a.attname) = 'email'
                """,
                rs -> rs.next() ? rs.getString(1) : null);

        if (constraintName != null) {
            log.info("Dropping legacy customers.email unique constraint: {}", constraintName);
            jdbcTemplate.execute("ALTER TABLE customers DROP CONSTRAINT IF EXISTS " + constraintName);
        }
    }

    private void ensureTenantScopedEmailUniqueness() {
        Boolean alreadyExists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1
                    FROM pg_constraint c
                    JOIN pg_class t ON c.conrelid = t.oid
                    WHERE t.relname = 'customers'
                      AND c.contype = 'u'
                      AND c.conname = 'uk_customers_tenant_email'
                )
                """,
                Boolean.class);

        if (Boolean.FALSE.equals(alreadyExists)) {
            log.info("Creating tenant-scoped unique constraint for customers (tenant_id, email)");
            jdbcTemplate.execute(
                    "ALTER TABLE customers ADD CONSTRAINT uk_customers_tenant_email UNIQUE (tenant_id, email)");
        }
    }
}