package com.example.vod.repository;

import com.example.vod.domain.WatchProgressEntity;
import com.example.vod.domain.WatchProgressEntity.Key;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WatchProgressRepository extends JpaRepository<WatchProgressEntity, Key> {
}
