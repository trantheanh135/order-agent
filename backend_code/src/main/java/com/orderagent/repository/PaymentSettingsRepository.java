package com.orderagent.repository;

import com.orderagent.model.PaymentSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentSettingsRepository extends JpaRepository<PaymentSettings, Long> {
}
