package com.coregate.backend.api;

import com.coregate.backend.domain.ProductArchiveEntity;
import com.coregate.backend.service.AdminAuthService;
import com.coregate.backend.service.ProductArchiveService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/product-archives")
public class ProductArchiveController {
    private final AdminAuthService adminAuthService;
    private final ProductArchiveService productArchiveService;

    public ProductArchiveController(AdminAuthService adminAuthService, ProductArchiveService productArchiveService) {
        this.adminAuthService = adminAuthService;
        this.productArchiveService = productArchiveService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> upload(
        @RequestHeader(value = "X-Admin-Username", required = false) String username,
        @RequestHeader(value = "X-Admin-Password", required = false) String password,
        @RequestParam String productId,
        @RequestParam(required = false) String fileName,
        @RequestPart("file") MultipartFile file
    ) throws Exception {
        adminAuthService.requireAdmin(username, password);
        ProductArchiveEntity saved = productArchiveService.upload(productId, fileName, file);
        return ResponseEntity.ok(new UploadResponse(
            saved.getProductId(),
            saved.getFileName(),
            saved.getFileSizeBytes(),
            saved.getUploadedAt().toString()
        ));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductArchiveService.ProductArchiveStatus> status(
        @RequestHeader(value = "X-Admin-Username", required = false) String username,
        @RequestHeader(value = "X-Admin-Password", required = false) String password,
        @PathVariable String productId
    ) {
        adminAuthService.requireAdmin(username, password);
        return productArchiveService.getStatus(productId)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record UploadResponse(String productId, String fileName, long fileSizeBytes, String uploadedAt) {}
}
