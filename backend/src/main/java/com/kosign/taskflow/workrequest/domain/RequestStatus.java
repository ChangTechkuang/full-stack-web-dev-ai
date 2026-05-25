package com.kosign.taskflow.workrequest.domain;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public enum RequestStatus {
    PENDING,
    IN_PROGRESS,
    DONE,
    REJECTED;

    private static final Map<RequestStatus, Set<RequestStatus>> ALLOWED_TRANSITIONS = Map.of(
            PENDING,     EnumSet.of(IN_PROGRESS, REJECTED),
            IN_PROGRESS, EnumSet.of(DONE, REJECTED),
            DONE,        EnumSet.noneOf(RequestStatus.class),
            REJECTED,    EnumSet.noneOf(RequestStatus.class)
    );

    public boolean canTransitionTo(RequestStatus next) {
        return ALLOWED_TRANSITIONS.getOrDefault(this, Set.of()).contains(next);
    }
}
