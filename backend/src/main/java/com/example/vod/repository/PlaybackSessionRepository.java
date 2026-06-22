package com.example.vod.repository;

import com.example.vod.domain.PlaybackSessionEntity;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PlaybackSessionRepository extends JpaRepository<PlaybackSessionEntity, UUID> {

    List<PlaybackSessionEntity> findByUserIdAndLastHeartbeatAfter(UUID userId, Instant cutoff);

    @Modifying
    @Transactional
    @Query("DELETE FROM PlaybackSessionEntity s WHERE s.lastHeartbeat < :cutoff")
    int deleteStale(@Param("cutoff") Instant cutoff);
}
