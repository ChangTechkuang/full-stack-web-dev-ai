package com.kosign.taskflow.user.dto;

import com.kosign.taskflow.user.domain.Role;
import com.kosign.taskflow.user.domain.User;

import java.util.UUID;

public record UserResponse(UUID id, String email, String fullName, Role role) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }
}
