package com.example.vod.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class MediaDirectoryInitializer implements CommandLineRunner {

    private final MediaProperties properties;

    public MediaDirectoryInitializer(MediaProperties properties) {
        this.properties = properties;
    }

    @Override
    public void run(String... args) throws IOException {
        Files.createDirectories(Path.of(properties.getUploadDir()));
        Files.createDirectories(Path.of(properties.getProcessedDir()));
    }
}
