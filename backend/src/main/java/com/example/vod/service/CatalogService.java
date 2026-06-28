package com.example.vod.service;

import com.example.vod.domain.SeasonEntity;
import com.example.vod.domain.SeriesEntity;
import com.example.vod.domain.VideoAssetEntity;
import com.example.vod.dto.CreateSeasonRequest;
import com.example.vod.dto.CreateSeriesRequest;
import com.example.vod.repository.SeasonRepository;
import com.example.vod.repository.SeriesRepository;
import com.example.vod.repository.VideoAssetRepository;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {

    private final SeriesRepository series;
    private final SeasonRepository seasons;
    private final VideoAssetRepository assets;

    public CatalogService(SeriesRepository series,
                          SeasonRepository seasons,
                          VideoAssetRepository assets) {
        this.series = series;
        this.seasons = seasons;
        this.assets = assets;
    }

    public List<SeriesEntity> listSeries() {
        return series.findAllByOrderByTitleAsc();
    }

    public SeriesEntity getSeries(UUID id) {
        return series.findById(id).orElseThrow();
    }

    @Transactional
    public SeriesEntity createSeries(CreateSeriesRequest req) {
        SeriesEntity e = new SeriesEntity();
        e.setId(UUID.randomUUID());
        e.setTitle(req.title().trim());
        e.setDescription(blankToNull(req.description()));
        try {
            return series.save(e);
        } catch (DataIntegrityViolationException ex) {
            // Title uniqueness violation.
            throw new IllegalStateException("series title already exists");
        }
    }

    @Transactional
    public void deleteSeries(UUID id) {
        if (!series.existsById(id)) throw new NoSuchElementException();
        // ON DELETE CASCADE drops seasons; ON DELETE SET NULL detaches assets.
        series.deleteById(id);
    }

    public List<SeasonEntity> listSeasons(UUID seriesId) {
        if (!series.existsById(seriesId)) throw new NoSuchElementException();
        return seasons.findBySeriesIdOrderBySeasonNumberAsc(seriesId);
    }

    public SeasonEntity getSeason(UUID id) {
        return seasons.findById(id).orElseThrow();
    }

    @Transactional
    public SeasonEntity createSeason(UUID seriesId, CreateSeasonRequest req) {
        if (!series.existsById(seriesId)) throw new NoSuchElementException();
        SeasonEntity e = new SeasonEntity();
        e.setId(UUID.randomUUID());
        e.setSeriesId(seriesId);
        e.setSeasonNumber(req.seasonNumber());
        e.setTitle(blankToNull(req.title()));
        try {
            return seasons.save(e);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException("season " + req.seasonNumber()
                + " already exists for this series");
        }
    }

    @Transactional
    public void deleteSeason(UUID id) {
        if (!seasons.existsById(id)) throw new NoSuchElementException();
        seasons.deleteById(id);
    }

    @Transactional
    public VideoAssetEntity attachAssetToSeason(UUID assetId,
                                                 UUID seasonId,
                                                 Integer episodeNumber) {
        VideoAssetEntity asset = assets.findById(assetId).orElseThrow();
        if (seasonId == null) {
            // detach
            asset.setSeasonId(null);
            asset.setEpisodeNumber(null);
            return assets.save(asset);
        }
        if (episodeNumber == null) {
            throw new IllegalStateException("episodeNumber is required when seasonId is set");
        }
        if (!seasons.existsById(seasonId)) {
            throw new NoSuchElementException();
        }
        asset.setSeasonId(seasonId);
        asset.setEpisodeNumber(episodeNumber);
        try {
            return assets.save(asset);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException("episode " + episodeNumber
                + " already exists in this season");
        }
    }

    /**
     * Up-next resolver — same-season episode+1, else next season's first
     * episode. Returns Optional.empty() when the current asset is not
     * attached to a season, or when there's nothing after it.
     */
    public Optional<VideoAssetEntity> findUpNext(VideoAssetEntity current) {
        UUID seasonId = current.getSeasonId();
        Integer ep = current.getEpisodeNumber();
        if (seasonId == null || ep == null) return Optional.empty();

        var nextInSeason = assets.findNextEpisodeInSeason(seasonId, ep, PageRequest.of(0, 1));
        if (!nextInSeason.isEmpty()) {
            return Optional.of(nextInSeason.get(0));
        }

        // Fall through to the first PUBLISHED episode of the next season in this series.
        SeasonEntity currentSeason = seasons.findById(seasonId).orElse(null);
        if (currentSeason == null) return Optional.empty();

        Optional<SeasonEntity> nextSeason = seasons.findBySeriesIdAndSeasonNumber(
            currentSeason.getSeriesId(),
            currentSeason.getSeasonNumber() + 1);
        if (nextSeason.isEmpty()) return Optional.empty();

        var firstOfNext = assets.findFirstEpisodeInSeason(nextSeason.get().getId(), PageRequest.of(0, 1));
        return firstOfNext.isEmpty() ? Optional.empty() : Optional.of(firstOfNext.get(0));
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
