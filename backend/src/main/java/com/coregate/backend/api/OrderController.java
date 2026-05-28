package com.coregate.backend.api;

import com.coregate.backend.api.dto.OrderDtos;
import com.coregate.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDtos.CreateOrderResponse createOrder(@Valid @RequestBody OrderDtos.CreateOrderRequest request) {
        return orderService.createOrder(request, "demo-user");
    }

    @GetMapping("/{id}")
    public OrderDtos.OrderResponse getOrder(@PathVariable UUID id) {
        return orderService.getOrder(id);
    }
}
