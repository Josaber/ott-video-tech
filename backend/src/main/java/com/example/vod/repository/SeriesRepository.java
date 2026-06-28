package com.example.vod.repository;

import com.example.vod.domain.SeriesEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeriesRepository extends JpaRepository<SeriesEntity, UUID> {
    List<SeriesEntity> findAllByOrderByTitleAsc();
}
