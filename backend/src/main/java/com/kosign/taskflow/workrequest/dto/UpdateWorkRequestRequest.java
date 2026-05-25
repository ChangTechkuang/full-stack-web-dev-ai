package com.kosign.taskflow.workrequest.dto;

import com.kosign.taskflow.workrequest.domain.Priority;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateWorkRequestRequest(
        @Size(max = 200) String title,
        @Size(max = 5000) String description,
        Priority priority,
        UUID assigneeId,
        LocalDate dueDate
) {}
