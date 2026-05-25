package com.kosign.taskflow.workrequest.dto;

import com.kosign.taskflow.workrequest.domain.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record CreateWorkRequestRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 5000) String description,
        Priority priority,
        UUID assigneeId,
        LocalDate dueDate
) {}
