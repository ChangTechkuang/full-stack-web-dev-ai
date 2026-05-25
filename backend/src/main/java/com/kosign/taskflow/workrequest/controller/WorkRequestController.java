package com.kosign.taskflow.workrequest.controller;

import com.kosign.taskflow.common.api.ApiMeta;
import com.kosign.taskflow.common.api.ApiResponse;
import com.kosign.taskflow.security.AuthenticatedUser;
import com.kosign.taskflow.security.CurrentUser;
import com.kosign.taskflow.workrequest.domain.Priority;
import com.kosign.taskflow.workrequest.domain.RequestStatus;
import com.kosign.taskflow.workrequest.dto.CreateWorkRequestRequest;
import com.kosign.taskflow.workrequest.dto.StatusChangeRequest;
import com.kosign.taskflow.workrequest.dto.UpdateWorkRequestRequest;
import com.kosign.taskflow.workrequest.dto.WorkRequestResponse;
import com.kosign.taskflow.workrequest.service.WorkRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Work Requests", description = "Submit, view, and manage work requests")
@RestController
@RequestMapping("/api/v1/work-requests")
@RequiredArgsConstructor
public class WorkRequestController {

    private final WorkRequestService service;

    @Operation(summary = "List work requests with filters and pagination")
    @GetMapping
    public ApiResponse<java.util.List<WorkRequestResponse>> list(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) UUID assigneeId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @CurrentUser AuthenticatedUser caller
    ) {
        Page<WorkRequestResponse> page = service.search(status, priority, assigneeId, search, pageable, caller);
        return ApiResponse.ok(page.getContent(), ApiMeta.from(page));
    }

    @Operation(summary = "Get a single work request by id")
    @GetMapping("/{id}")
    public ApiResponse<WorkRequestResponse> get(@PathVariable UUID id, @CurrentUser AuthenticatedUser caller) {
        return ApiResponse.ok(service.getById(id, caller));
    }

    @Operation(summary = "Submit a new work request")
    @PostMapping
    public ResponseEntity<ApiResponse<WorkRequestResponse>> create(
            @Valid @RequestBody CreateWorkRequestRequest request,
            @CurrentUser AuthenticatedUser caller
    ) {
        WorkRequestResponse created = service.create(request, caller);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created));
    }

    @Operation(summary = "Update an existing work request")
    @PutMapping("/{id}")
    public ApiResponse<WorkRequestResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateWorkRequestRequest request,
            @CurrentUser AuthenticatedUser caller
    ) {
        return ApiResponse.ok(service.update(id, request, caller));
    }

    @Operation(summary = "Change the status of a work request (managers only)")
    @PatchMapping("/{id}/status")
    public ApiResponse<WorkRequestResponse> changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody StatusChangeRequest request,
            @CurrentUser AuthenticatedUser caller
    ) {
        return ApiResponse.ok(service.changeStatus(id, request.status(), caller));
    }

    @Operation(summary = "Delete a work request")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id, @CurrentUser AuthenticatedUser caller) {
        service.delete(id, caller);
        return ResponseEntity.noContent().build();
    }
}
