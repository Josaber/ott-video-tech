package com.example.vod.repository;

import com.example.vod.domain.SeasonEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeasonRepository extends JpaRepository<SeasonEntity, UUID> {
    List<SeasonEntity> findBySeriesIdOrderBySeasonNumberAsc(UUID seriesId);
    Optional<SeasonEntity> findBySeriesIdAndSeasonNumber(UUID seriesId, int seasonNumber);
}
