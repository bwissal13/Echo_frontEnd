package com.yourpackage.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.extern.slf4j.Slf4j;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@Slf4j
public class StorageConfig {
    @Value("${file.upload-dir}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            log.info("Initializing storage: {}", uploadPath);
            
            if (!Files.exists(uploadPath)) {
                log.info("Creating upload directory: {}", uploadPath);
                Files.createDirectories(uploadPath);
            }
            
            // Test write permissions
            String testFile = "test.txt";
            Path testPath = uploadPath.resolve(testFile);
            try {
                Files.writeString(testPath, "test");
                Files.delete(testPath);
                log.info("Storage directory is writable");
            } catch (IOException e) {
                throw new RuntimeException("Upload directory is not writable!", e);
            }
            
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage!", e);
        }
    }

    @Bean
    public String uploadDir() {
        return uploadDir;
    }
} 