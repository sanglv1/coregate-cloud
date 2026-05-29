package com.coregate.backend.service;

import com.coregate.backend.domain.ProductArchiveEntity;
import com.coregate.backend.repository.ProductArchiveRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class ProductArchiveService {
    private static final Pattern PRODUCT_ID_PATTERN = Pattern.compile("^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$");
    private static final Pattern ZIP_NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9][a-zA-Z0-9._-]*\\.zip$", Pattern.CASE_INSENSITIVE);

    private static final Map<String, String> LEGACY_ARCHIVES = Map.of(
        "vnpay-pay", "payment-demo.zip",
        "vnpay-merchant-hosted", "merchant-hosted-demo.zip",
        "vnpay-payment-link", "paymentlink-demo.zip",
        "vnpay-token", "token-demo.zip",
        "vnpay-installment", "installment-demo.zip",
        "vnpay-recurring", "recurring-demo.zip",
        "vnpay-preauth", "preauth-demo.zip"
    );

    private final ProductArchiveRepository productArchiveRepository;
    private final Path storageRoot;
    private final long maxUploadBytes;

    public ProductArchiveService(
        ProductArchiveRepository productArchiveRepository,
        @Value("${app.download.storage-dir:./assets/products}") String storageDir,
        @Value("${app.upload.max-bytes:209715200}") long maxUploadBytes
    ) {
        this.productArchiveRepository = productArchiveRepository;
        this.storageRoot = Paths.get(storageDir).toAbsolutePath().normalize();
        this.maxUploadBytes = maxUploadBytes;
    }

    @Transactional
    public ProductArchiveEntity upload(String productId, String requestedFileName, MultipartFile file) throws IOException {
        validateProductId(productId);
        if (file == null || file.isEmpty()) {
            throw new IllegalStateException("ZIP file is required");
        }
        if (file.getSize() > maxUploadBytes) {
            throw new IllegalStateException("File exceeds maximum upload size");
        }
        String originalName = file.getOriginalFilename() == null ? "" : Paths.get(file.getOriginalFilename()).getFileName().toString();
        if (!originalName.toLowerCase().endsWith(".zip")) {
            throw new IllegalStateException("Only .zip files are allowed");
        }

        String fileName = sanitizeFileName(requestedFileName, productId);
        Path target = storageRoot.resolve(fileName).normalize();
        if (!target.startsWith(storageRoot)) {
            throw new IllegalStateException("Invalid file path");
        }

        Files.createDirectories(storageRoot);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        ProductArchiveEntity entity = productArchiveRepository.findById(productId).orElseGet(ProductArchiveEntity::new);
        entity.setProductId(productId);
        entity.setFileName(fileName);
        entity.setFileSizeBytes(Files.size(target));
        entity.setUploadedAt(Instant.now());
        return productArchiveRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public Optional<ProductArchiveStatus> getStatus(String productId) {
        validateProductId(productId);
        String fileName = resolveFileName(productId);
        Path filePath = storageRoot.resolve(fileName).normalize();
        boolean onDisk = filePath.startsWith(storageRoot) && Files.isRegularFile(filePath);
        long size = 0L;
        Instant uploadedAt = null;
        if (onDisk) {
            try {
                size = Files.size(filePath);
            } catch (IOException ignored) {
                onDisk = false;
            }
        }
        Optional<ProductArchiveEntity> entity = productArchiveRepository.findById(productId);
        if (entity.isPresent()) {
            uploadedAt = entity.get().getUploadedAt();
            if (!onDisk) {
                size = entity.get().getFileSizeBytes();
            }
        }
        return Optional.of(new ProductArchiveStatus(productId, fileName, onDisk, size, uploadedAt));
    }

    public String resolveFileName(String productId) {
        return productArchiveRepository.findById(productId)
            .map(ProductArchiveEntity::getFileName)
            .orElseGet(() -> LEGACY_ARCHIVES.getOrDefault(productId, productId + ".zip"));
    }

    private void validateProductId(String productId) {
        if (productId == null || !PRODUCT_ID_PATTERN.matcher(productId).matches()) {
            throw new IllegalStateException("Invalid product ID");
        }
    }

    private String sanitizeFileName(String requestedFileName, String productId) {
        String candidate = requestedFileName == null || requestedFileName.isBlank()
            ? productId + ".zip"
            : Paths.get(requestedFileName).getFileName().toString();
        if (!ZIP_NAME_PATTERN.matcher(candidate).matches()) {
            throw new IllegalStateException("Invalid ZIP file name");
        }
        return candidate;
    }

    public record ProductArchiveStatus(
        String productId,
        String fileName,
        boolean fileOnDisk,
        long fileSizeBytes,
        Instant uploadedAt
    ) {}
}
