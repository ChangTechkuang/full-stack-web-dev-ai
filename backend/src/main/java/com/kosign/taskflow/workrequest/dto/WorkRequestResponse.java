package com.kosign.taskflow.workrequest.dto;

import com.kosign.taskflow.user.dto.UserResponse;
import com.kosign.taskflow.workrequest.domain.Priority;
import com.kosign.taskflow.workrequest.domain.RequestStatus;
import com.kosign.taskflow.workrequest.domain.WorkRequest;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record WorkRequestResponse(
        UUID id,
        String title,
        String description,
        RequestStatus status,
        Priority priority,
        UserResponse requester,
        UserResponse assignee,
        LocalDate dueDate,
        Instant createdAt,
        Instant updatedAt
) {
    public static WorkRequestResponse from(WorkRequest wr) {
        return new WorkRequestResponse(
                wr.getId(),
                wr.getTitle(),
                wr.getDescription(),
                wr.getStatus(),
                wr.getPriority(),
                wr.getRequester() != null ? UserResponse.from(wr.getRequester()) : null,
                wr.getAssignee() != null ? UserResponse.from(wr.getAssignee()) : null,
                wr.getDueDate(),
                wr.getCreatedAt(),
                wr.getUpdatedAt()
        );
    }
}
