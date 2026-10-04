package com.orderagent.config;

import com.orderagent.model.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Hibernate (ddl-auto=update) creates a CHECK constraint listing the enum values the first time it creates
 * the table and never updates it, so a newly added OrderStatus (AWAITING_PAYMENT) would be rejected by the
 * database. Re-create the constraint from the current enum on every start. Idempotent.
 */
@Component
@RequiredArgsConstructor
public class OrderSchemaMigration implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(OrderSchemaMigration.class);

    private final JdbcTemplate jdbc;

    @Override
    public void run(ApplicationArguments args) {
        String values = Arrays.stream(OrderStatus.values())
                .map(s -> "'" + s.name() + "'")
                .collect(Collectors.joining(", "));
        try {
            jdbc.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
            jdbc.execute("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN (" + values + "))");
            log.info("orders_status_check now allows: {}", values);
        } catch (Exception e) {
            // Never block startup over this; a failure shows up as an error when the new status is first saved.
            log.warn("Could not refresh orders_status_check: {}", e.getMessage());
        }
    }
}
