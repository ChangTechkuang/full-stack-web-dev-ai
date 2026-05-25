package com.kosign.taskflow.auth.dto;

import com.kosign.taskflow.user.dto.UserResponse;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {}
