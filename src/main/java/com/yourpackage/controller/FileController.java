package com.yourpackage.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.util.HashMap;
import java.util.Map;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.net.MalformedURLException;
import lombok.extern.slf4j.Slf4j;
import com.yourpackage.service.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import java.nio.file.Files;

@RestController
@RequestMapping("/api/v1/files")
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class FileController {
    private final StorageService storageService;
    private final String uploadDir;

    public FileController(StorageService storageService, @Value("${file.upload-dir}") String uploadDir) {
        this.storageService = storageService;
        this.uploadDir = uploadDir;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> handleFileUpload(@RequestParam("file") MultipartFile file) {
        log.info("Received file upload request: {}", file.getOriginalFilename());
        try {
            String path = storageService.store(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", "http://localhost:8080" + path); // Add your server URL
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to upload file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path file = Paths.get(uploadDir).resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            
            if (resource.exists() || resource.isReadable()) {
                String contentType = Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
            } else {
                throw new RuntimeException("Could not read file: " + filename);
            }
        } catch (IOException e) {
            log.error("Error serving file: {}", filename, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 