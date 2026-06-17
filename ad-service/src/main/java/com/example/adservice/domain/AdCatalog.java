package com.example.adservice.domain;

import com.example.adservice.config.AdProperties;
import com.example.adservice.config.AdProperties.AdEntry;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class AdCatalog {

    private final AdProperties properties;

    public AdCatalog(AdProperties properties) {
        this.properties = properties;
    }

    public List<AdEntry> all() {
        return List.copyOf(properties.getCatalog());
    }

    public Optional<AdEntry> find(String id) {
        return properties.getCatalog().stream()
                .filter(ad -> ad.getId().equals(id))
                .findFirst();
    }

    public AdEntry pickDefault() {
        if (properties.getCatalog().isEmpty()) {
            throw new IllegalStateException("ad catalog is empty");
        }
        return properties.getCatalog().get(0);
    }
}
