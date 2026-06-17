package com.example.vod.repository;

import com.example.vod.domain.UserEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByUsername(String username);

    /**
     * Atomic increment. Avoids the read-modify-write race where two
     * concurrent change-password calls both read token_version=N and both
     * write N+1, effectively only invalidating one token version's worth
     * of issued tokens.
     *
     * clearAutomatically=true so any UserEntity already in the persistence
     * context drops the stale tokenVersion; the next findByUsername()
     * inside the same transaction re-hydrates from the post-UPDATE row.
     * Without this, AuthService.changePassword would issue replacement
     * tokens stamped with the OLD token_version, immediately invalidating
     * itself on the next request.
     */
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("update UserEntity u set u.tokenVersion = u.tokenVersion + 1 where u.username = :username")
    int incrementTokenVersion(@Param("username") String username);
}
