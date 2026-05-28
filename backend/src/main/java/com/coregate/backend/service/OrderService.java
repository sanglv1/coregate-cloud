package com.coregate.backend.service;

import com.coregate.backend.api.dto.OrderDtos;
import com.coregate.backend.domain.OrderEntity;
import com.coregate.backend.domain.OrderItemEntity;
import com.coregate.backend.domain.OrderStatus;
import com.coregate.backend.repository.OrderItemRepository;
import com.coregate.backend.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private static final long DEFAULT_UNIT_PRICE = 100_000L;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional
    public OrderDtos.CreateOrderResponse createOrder(OrderDtos.CreateOrderRequest request, String customerId) {
        UUID orderId = UUID.randomUUID();
        long totalAmount = request.items().stream().mapToLong(item -> item.quantity() * DEFAULT_UNIT_PRICE).sum();

        OrderEntity order = new OrderEntity();
        order.setId(orderId);
        order.setCustomerId(customerId);
        order.setCustomerEmail(request.customerEmail());
        order.setStatus(OrderStatus.PENDING);
        order.setTotalAmount(totalAmount);
        orderRepository.save(order);

        List<OrderItemEntity> items = request.items().stream().map(input -> {
            OrderItemEntity item = new OrderItemEntity();
            item.setId(UUID.randomUUID());
            item.setOrderId(orderId);
            item.setProductId(input.productId());
            item.setQuantity(input.quantity());
            item.setUnitPrice(DEFAULT_UNIT_PRICE);
            return item;
        }).toList();
        orderItemRepository.saveAll(items);

        return new OrderDtos.CreateOrderResponse(List.of(toOrderResponse(order, items)));
    }

    @Transactional(readOnly = true)
    public OrderDtos.OrderResponse getOrder(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        List<OrderItemEntity> items = orderItemRepository.findByOrderId(orderId);
        return toOrderResponse(order, items);
    }

    @Transactional
    public void markOrderCompleted(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);
    }

    @Transactional
    public void markOrderFailed(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(OrderStatus.FAILED);
        orderRepository.save(order);
    }

    private OrderDtos.OrderResponse toOrderResponse(OrderEntity order, List<OrderItemEntity> items) {
        List<OrderDtos.OrderItemResponse> itemResponses = items.stream()
            .map(i -> new OrderDtos.OrderItemResponse(i.getProductId(), i.getQuantity(), i.getUnitPrice()))
            .toList();
        return new OrderDtos.OrderResponse(
            order.getId(),
            order.getCustomerId(),
            order.getCustomerEmail(),
            order.getStatus().name().toLowerCase(),
            order.getTotalAmount(),
            order.getCurrency(),
            itemResponses
        );
    }
}
