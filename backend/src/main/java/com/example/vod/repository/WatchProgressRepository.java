package com.example.vod.repository;

import com.example.vod.domain.WatchProgressEntity;
import com.example.vod.domain.WatchProgressEntity.Key;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WatchProgressRepository extends JpaRepository<WatchProgressEntity, Key> {

    // Recent in-progress watches for a user — drives the homepage
    // continue-watching rail. Excludes positionMs=0 so finished /
    // never-started rows don't leak in.
    List<WatchProgressEntity> findByUserIdAndPositionMsGreaterThanOrderByUpdatedAtDesc(
        UUID userId, long positionMs, Pageable pageable);
}
