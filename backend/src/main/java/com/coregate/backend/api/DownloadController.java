package com.coregate.backend.api;

import com.coregate.backend.api.dto.DownloadDtos;
import com.coregate.backend.domain.DownloadTokenEntity;
import com.coregate.backend.service.DownloadService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/downloads")
public class DownloadController {
    private final DownloadService downloadService;
    private final Path storageRoot;

    public DownloadController(
        DownloadService downloadService,
        @Value("${app.download.storage-dir:./assets/products}") String storageDir
    ) {
        this.downloadService = downloadService;
        this.storageRoot = Paths.get(storageDir).toAbsolutePath().normalize();
    }

    @GetMapping
    public DownloadDtos.DownloadLinksPayload downloads(@RequestParam UUID orderId) {
        return downloadService.listLinks(orderId);
    }

    @GetMapping("/access-code")
    public DownloadDtos.AccessCodeResponse accessCode(@RequestParam UUID orderId) {
        return downloadService.getAccessCode(orderId);
    }

    @PostMapping("/redeem")
    public DownloadDtos.DownloadLinksPayload redeem(@RequestBody DownloadDtos.RedeemCodeRequest request) {
        return downloadService.redeemCode(request.accessCode());
    }

    @GetMapping("/file/{token}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String token) throws Exception {
        DownloadTokenEntity link = downloadService.getByToken(token);
        String fileName = downloadService.resolveArchiveFileName(link.getProductId());
        Path filePath = storageRoot.resolve(fileName).normalize();
        if (!filePath.startsWith(storageRoot)) {
            return ResponseEntity.notFound().build();
        }
        if (!Files.exists(filePath)) {
            throw new IllegalArgumentException(
                "File \"" + fileName + "\" not found in " + storageRoot
                    + ". Add the zip to your download folder (DOWNLOAD_HOST_DIR / DOWNLOAD_STORAGE_DIR)."
            );
        }

        Resource resource = new PathResource(filePath);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filePath.getFileName() + "\"")
            .body(resource);
    }
}
