package com.kosign.taskflow.workrequest.dto;

import com.kosign.taskflow.workrequest.domain.RequestStatus;
import jakarta.validation.constraints.NotNull;

public record StatusChangeRequest(@NotNull RequestStatus status) {}
