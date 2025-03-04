package com.yourpackage.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class StorageService {
    private final Path rootLocation;
    
    public StorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        log.info("Storage service initialized with root location: {}", this.rootLocation);
    }

    public String store(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new StorageException("Failed to store empty file");
            }

            // Clean the filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            if (originalFilename.contains("..")) {
                throw new StorageException("Cannot store file with relative path outside current directory " + originalFilename);
            }

            // Generate unique filename
            String filename = UUID.randomUUID().toString() + "_" + originalFilename;
            Path destinationFile = this.rootLocation.resolve(filename).normalize();

            log.info("Storing file {} to {}", originalFilename, destinationFile);

            // Ensure the destination is inside the upload directory
            if (!destinationFile.getParent().equals(this.rootLocation)) {
                throw new StorageException("Cannot store file outside upload directory");
            }

            // Copy the file
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
                log.info("Successfully stored file: {}", filename);
                return "/api/v1/files/" + filename;
            }

        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new StorageException("Failed to store file", e);
        }
    }
} 