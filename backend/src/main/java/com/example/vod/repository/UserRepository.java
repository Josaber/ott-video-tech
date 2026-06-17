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
     */
    @Modifying
    @Transactional
    @Query("update UserEntity u set u.tokenVersion = u.tokenVersion + 1 where u.username = :username")
    int incrementTokenVersion(@Param("username") String username);
}
