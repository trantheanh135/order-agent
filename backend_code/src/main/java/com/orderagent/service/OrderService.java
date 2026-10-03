package com.orderagent.service;

import com.orderagent.dto.OrderItemRequest;
import com.orderagent.dto.OrderResponse;
import com.orderagent.dto.OrderUpdateRequest;
import com.orderagent.exception.BadRequestException;
import com.orderagent.exception.ResourceNotFoundException;
import com.orderagent.model.CustomerOrder;
import com.orderagent.model.OrderItem;
import com.orderagent.model.OrderStatus;
import com.orderagent.model.User;
import com.orderagent.repository.CustomerOrderRepository;
import com.orderagent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Orders. A customer builds ONE open order (status NEW) by adding products from the extension, can
 * review and change it, then confirms it (CONFIRMED). Only confirmed orders reach staff.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private static final int MAX_QUANTITY = 99999;

    private final CustomerOrderRepository orderRepository;
    private final UserRepository userRepository;

    // ---- customer: the open order ------------------------------------------------------------

    @Transactional(readOnly = true)
    public OrderResponse getCurrent(UUID customerId) {
        return orderRepository.findFirstByCustomer_IdAndStatus(customerId, OrderStatus.NEW)
                .map(o -> OrderResponse.fromEntity(o, false))
                .orElseGet(OrderResponse::emptyDraft);
    }

    /** Adds a product to the open order (created on first use). The same product + variant adds up. */
    public OrderResponse addItem(UUID customerId, OrderItemRequest request) {
        CustomerOrder order = currentOrCreate(customerId);
        int quantity = request.getQuantity() != null ? request.getQuantity() : 1;

        OrderItem existing = order.getItems().stream()
                .filter(i -> Objects.equals(i.getProductUrl(), request.getUrl())
                        && Objects.equals(i.getCustomerNote(), request.getCustomerNote()))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(Math.min(MAX_QUANTITY, existing.getQuantity() + quantity));
            if (request.getPrice() != null) {
                existing.setPrice(request.getPrice()); // keep the freshest price seen on the page
            }
        } else {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setSite(request.getSite());
            item.setProductUrl(request.getUrl());
            item.setTitle(request.getTitle());
            item.setImageUrl(request.getImageUrl());
            item.setPrice(request.getPrice());
            item.setCategory(request.getCategory() != null ? request.getCategory() : "Uncategorized");
            item.setQuantity(quantity);
            item.setCustomerNote(request.getCustomerNote());
            order.getItems().add(item);
        }
        orderRepository.save(order);
        return OrderResponse.fromEntity(order, false);
    }

    public OrderResponse updateItemQuantity(UUID customerId, UUID itemId, int quantity) {
        CustomerOrder order = currentOrThrow(customerId);
        OrderItem item = findItem(order, itemId);
        item.setQuantity(quantity);
        orderRepository.save(order);
        return OrderResponse.fromEntity(order, false);
    }

    public OrderResponse removeItem(UUID customerId, UUID itemId) {
        CustomerOrder order = currentOrThrow(customerId);
        OrderItem item = findItem(order, itemId);
        order.getItems().remove(item);
        if (order.getItems().isEmpty()) {
            orderRepository.delete(order); // an empty open order is just noise
            return OrderResponse.emptyDraft();
        }
        orderRepository.save(order);
        return OrderResponse.fromEntity(order, false);
    }

    /** Throws the open order away. */
    public OrderResponse discardCurrent(UUID customerId) {
        orderRepository.findFirstByCustomer_IdAndStatus(customerId, OrderStatus.NEW).ifPresent(orderRepository::delete);
        return OrderResponse.emptyDraft();
    }

    /** NEW -> CONFIRMED. From now on the order is visible to staff and can no longer be edited. */
    public OrderResponse confirm(UUID customerId) {
        CustomerOrder order = currentOrThrow(customerId);
        if (order.getItems().isEmpty()) {
            throw new BadRequestException("The order has no items");
        }
        order.setStatus(OrderStatus.CONFIRMED);
        order.setConfirmedAt(LocalDateTime.now());
        orderRepository.save(order);
        return OrderResponse.fromEntity(order, false);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> listMine(UUID customerId) {
        return orderRepository.findByCustomer_IdOrderByCreatedAtDesc(customerId).stream()
                .map(o -> OrderResponse.fromEntity(o, false))
                .toList();
    }

    // ---- staff: confirmed orders only ----------------------------------------------------------

    @Transactional(readOnly = true)
    public List<OrderResponse> listForStaff(OrderStatus statusFilter) {
        if (statusFilter == OrderStatus.NEW) {
            return List.of(); // open orders are private to the customer
        }
        List<CustomerOrder> orders = statusFilter != null
                ? orderRepository.findByStatusOrderByConfirmedAtDesc(statusFilter)
                : orderRepository.findByStatusNotOrderByConfirmedAtDesc(OrderStatus.NEW);
        return orders.stream().map(o -> OrderResponse.fromEntity(o, true)).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getForStaff(UUID id) {
        return OrderResponse.fromEntity(findConfirmedOrThrow(id), true);
    }

    public OrderResponse updateByStaff(UUID id, OrderUpdateRequest request) {
        CustomerOrder order = findConfirmedOrThrow(id);

        if (request.getStatus() != null && request.getStatus() != order.getStatus()) {
            if (request.getStatus() == OrderStatus.NEW) {
                throw new BadRequestException("A confirmed order cannot go back to NEW");
            }
            applyStatusTransition(order, request.getStatus());
        }
        if (request.getStaffNotes() != null) {
            order.setStaffNotes(request.getStaffNotes());
        }
        if (request.getTrackingNumber() != null) {
            order.setTrackingNumber(request.getTrackingNumber());
        }
        orderRepository.save(order);
        return OrderResponse.fromEntity(order, true);
    }

    // ---- helpers -------------------------------------------------------------------------------

    private void applyStatusTransition(CustomerOrder order, OrderStatus newStatus) {
        order.setStatus(newStatus);
        LocalDateTime now = LocalDateTime.now();
        switch (newStatus) {
            case PURCHASED -> order.setPurchasedAt(now);
            case SHIPPED -> order.setShippedAt(now);
            case DELIVERED -> order.setDeliveredAt(now);
            default -> { /* CONFIRMED / CANCELLED: no extra timestamp */ }
        }
    }

    private CustomerOrder currentOrCreate(UUID customerId) {
        return orderRepository.findFirstByCustomer_IdAndStatus(customerId, OrderStatus.NEW).orElseGet(() -> {
            User customer = userRepository.findById(customerId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));
            CustomerOrder order = new CustomerOrder();
            order.setCustomer(customer);
            order.setStatus(OrderStatus.NEW);
            return orderRepository.save(order);
        });
    }

    private CustomerOrder currentOrThrow(UUID customerId) {
        return orderRepository.findFirstByCustomer_IdAndStatus(customerId, OrderStatus.NEW)
                .orElseThrow(() -> new ResourceNotFoundException("You have no open order"));
    }

    private OrderItem findItem(CustomerOrder order, UUID itemId) {
        return order.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("OrderItem", "id", itemId));
    }

    private CustomerOrder findConfirmedOrThrow(UUID id) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        if (order.getStatus() == OrderStatus.NEW) {
            throw new ResourceNotFoundException("Order", "id", id); // staff never see open orders
        }
        return order;
    }
}
