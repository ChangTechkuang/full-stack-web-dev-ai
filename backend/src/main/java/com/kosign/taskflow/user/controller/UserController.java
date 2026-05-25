package com.kosign.taskflow.user.controller;

import com.kosign.taskflow.common.api.ApiResponse;
import com.kosign.taskflow.common.error.AppException;
import com.kosign.taskflow.common.error.ErrorCode;
import com.kosign.taskflow.security.AuthenticatedUser;
import com.kosign.taskflow.security.CurrentUser;
import com.kosign.taskflow.user.dto.UserResponse;
import com.kosign.taskflow.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Users")
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @Operation(summary = "Get the currently authenticated user")
    @GetMapping("/me")
    public ApiResponse<UserResponse> me(@CurrentUser AuthenticatedUser principal) {
        if (principal == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Not authenticated");
        }
        return ApiResponse.ok(userRepository.findById(principal.id())
                .map(UserResponse::from)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found")));
    }
}
