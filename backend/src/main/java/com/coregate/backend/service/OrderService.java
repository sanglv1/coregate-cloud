package com.coregate.backend.service;

import com.coregate.backend.api.dto.OrderDtos;
import com.coregate.backend.domain.OrderEntity;
import com.coregate.backend.domain.OrderItemEntity;
import com.coregate.backend.domain.OrderStatus;
import com.coregate.backend.domain.PaymentEntity;
import com.coregate.backend.repository.OrderItemRepository;
import com.coregate.backend.repository.OrderRepository;
import com.coregate.backend.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    private static final long DEFAULT_UNIT_PRICE = 100_000L;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;

    public OrderService(
        OrderRepository orderRepository,
        OrderItemRepository orderItemRepository,
        PaymentRepository paymentRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
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

    @Transactional(readOnly = true)
    public OrderDtos.OrderListResponse listOrders() {
        List<OrderDtos.OrderSummaryResponse> summaries = orderRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(this::toOrderSummary)
            .toList();
        return new OrderDtos.OrderListResponse(summaries);
    }

    @Transactional(readOnly = true)
    public OrderDtos.OrderDetailResponse getOrderDetail(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        List<OrderItemEntity> items = orderItemRepository.findByOrderId(orderId);
        Optional<PaymentEntity> payment = paymentRepository.findByOrderId(orderId);
        return new OrderDtos.OrderDetailResponse(
            toOrderResponse(order, items),
            payment.map(p -> p.getStatus().name().toLowerCase()).orElse(null),
            payment.map(PaymentEntity::getTxnRef).orElse(null),
            payment.map(PaymentEntity::getProvider).orElse(null)
        );
    }

    private OrderDtos.OrderSummaryResponse toOrderSummary(OrderEntity order) {
        List<OrderItemEntity> items = orderItemRepository.findByOrderId(order.getId());
        Optional<PaymentEntity> payment = paymentRepository.findByOrderId(order.getId());
        return new OrderDtos.OrderSummaryResponse(
            order.getId(),
            order.getCustomerEmail(),
            order.getStatus().name().toLowerCase(),
            order.getTotalAmount(),
            order.getCurrency(),
            order.getCreatedAt(),
            payment.map(p -> p.getStatus().name().toLowerCase()).orElse(null),
            payment.map(PaymentEntity::getTxnRef).orElse(null),
            items.size()
        );
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
            order.getCreatedAt(),
            order.getUpdatedAt(),
            itemResponses
        );
    }
}
