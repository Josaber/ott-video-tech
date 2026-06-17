package com.example.vod;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.vod.domain.UserEntity;
import com.example.vod.repository.UserRepository;
import com.example.vod.service.UserTokenVersionCache;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class UserTokenVersionCacheTest {

    private UserEntity user(long tv) {
        UserEntity u = new UserEntity();
        u.setUsername("alice");
        u.setTokenVersion(tv);
        return u;
    }

    @Test
    void hitsDbOnceThenServesFromCache() {
        UserRepository repo = Mockito.mock(UserRepository.class);
        when(repo.findByUsername("alice")).thenReturn(Optional.of(user(7)));
        UserTokenVersionCache cache = new UserTokenVersionCache(repo, 30, 100);

        assertThat(cache.get("alice")).hasValue(7L);
        assertThat(cache.get("alice")).hasValue(7L);
        assertThat(cache.get("alice")).hasValue(7L);
        verify(repo, times(1)).findByUsername("alice");
    }

    @Test
    void invalidateForcesReread() {
        UserRepository repo = Mockito.mock(UserRepository.class);
        when(repo.findByUsername("alice"))
                .thenReturn(Optional.of(user(7)))
                .thenReturn(Optional.of(user(8)));
        UserTokenVersionCache cache = new UserTokenVersionCache(repo, 30, 100);

        assertThat(cache.get("alice")).hasValue(7L);
        cache.invalidate("alice");
        assertThat(cache.get("alice")).hasValue(8L);
        verify(repo, times(2)).findByUsername("alice");
    }

    @Test
    void missingUserReturnsEmpty() {
        UserRepository repo = Mockito.mock(UserRepository.class);
        when(repo.findByUsername("ghost")).thenReturn(Optional.empty());
        UserTokenVersionCache cache = new UserTokenVersionCache(repo, 30, 100);

        assertThat(cache.get("ghost")).isEmpty();
    }
}
