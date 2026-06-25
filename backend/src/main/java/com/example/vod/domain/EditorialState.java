package com.example.vod.domain;

public enum EditorialState {
    DRAFT, IN_REVIEW, READY;

    /** Can the asset legally transition to the target state? */
    public boolean canTransitionTo(EditorialState target) {
        if (this == target) return false;
        return switch (this) {
            case DRAFT -> target == IN_REVIEW;
            case IN_REVIEW -> target == READY || target == DRAFT;
            case READY -> target == DRAFT;
        };
    }
}
