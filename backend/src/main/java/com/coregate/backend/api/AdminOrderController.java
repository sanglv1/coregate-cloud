package com.coregate.backend.api;

import com.coregate.backend.api.dto.OrderDtos;
import com.coregate.backend.service.AdminAuthService;
import com.coregate.backend.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {
    private final AdminAuthService adminAuthService;
    private final OrderService orderService;

    public AdminOrderController(AdminAuthService adminAuthService, OrderService orderService) {
        this.adminAuthService = adminAuthService;
        this.orderService = orderService;
    }

    @GetMapping
    public OrderDtos.OrderListResponse listOrders(
        @RequestHeader(value = "X-Admin-Username", required = false) String username,
        @RequestHeader(value = "X-Admin-Password", required = false) String password
    ) {
        adminAuthService.requireAdmin(username, password);
        return orderService.listOrders();
    }

    @GetMapping("/{id}")
    public OrderDtos.OrderDetailResponse getOrder(
        @RequestHeader(value = "X-Admin-Username", required = false) String username,
        @RequestHeader(value = "X-Admin-Password", required = false) String password,
        @PathVariable UUID id
    ) {
        adminAuthService.requireAdmin(username, password);
        return orderService.getOrderDetail(id);
    }
}
