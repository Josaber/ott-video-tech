package com.example.vod.repository;

import com.example.vod.domain.AssetStatus;
import com.example.vod.domain.VideoAssetEntity;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VideoAssetRepository extends JpaRepository<VideoAssetEntity, UUID> {

    /**
     * Bounded sweep input: caller passes a Pageable (e.g. PageRequest.of(0, 100))
     * to cap one tick's work so a long-untended box doesn't try to FAIL
     * thousands of assets in one transaction.
     */
    List<VideoAssetEntity> findByStatusAndUpdatedAtBeforeOrderByUpdatedAtAsc(
            AssetStatus status, Instant cutoff, Pageable pageable);

    Optional<VideoAssetEntity> findBySeasonIdAndEpisodeNumber(UUID seasonId, int episodeNumber);

    /**
     * "Next episode in this season" — used by the up-next lookup. Returns the
     * smallest episode_number STRICTLY greater than `afterEpisode` in the
     * given season. Restricted to PUBLISHED so a draft / failed asset doesn't
     * surface as auto-play.
     */
    @Query("SELECT v FROM VideoAssetEntity v "
        + "WHERE v.seasonId = :seasonId "
        + "AND v.episodeNumber > :afterEpisode "
        + "AND v.status = com.example.vod.domain.AssetStatus.PUBLISHED "
        + "ORDER BY v.episodeNumber ASC")
    List<VideoAssetEntity> findNextEpisodeInSeason(
            @Param("seasonId") UUID seasonId,
            @Param("afterEpisode") int afterEpisode,
            Pageable pageable);

    /**
     * First episode of a given season (smallest episode_number, PUBLISHED).
     * Returned as List so the caller can use Pageable to cap at 1.
     */
    @Query("SELECT v FROM VideoAssetEntity v "
        + "WHERE v.seasonId = :seasonId "
        + "AND v.episodeNumber IS NOT NULL "
        + "AND v.status = com.example.vod.domain.AssetStatus.PUBLISHED "
        + "ORDER BY v.episodeNumber ASC")
    List<VideoAssetEntity> findFirstEpisodeInSeason(
            @Param("seasonId") UUID seasonId,
            Pageable pageable);
}
