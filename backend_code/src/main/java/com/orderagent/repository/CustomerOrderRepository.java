package com.orderagent.repository;

import com.orderagent.model.CustomerOrder;
import com.orderagent.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, UUID> {

    // The customer's open order (at most one).
    Optional<CustomerOrder> findFirstByCustomer_IdAndStatus(UUID customerId, OrderStatus status);

    Optional<CustomerOrder> findByIdAndCustomer_Id(UUID id, UUID customerId);

    List<CustomerOrder> findByCustomer_IdOrderByCreatedAtDesc(UUID customerId);

    // Staff only ever see orders the customer has PAID (reported payment), never open or unpaid ones.
    List<CustomerOrder> findByPaidAtIsNotNullOrderByPaidAtDesc();

    List<CustomerOrder> findByPaidAtIsNotNullAndStatusOrderByPaidAtDesc(OrderStatus status);
}
