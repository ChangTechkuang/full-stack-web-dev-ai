package com.kosign.taskflow.workrequest.service;

import com.kosign.taskflow.common.error.AppException;
import com.kosign.taskflow.common.error.ErrorCode;
import com.kosign.taskflow.security.AuthenticatedUser;
import com.kosign.taskflow.user.domain.Role;
import com.kosign.taskflow.user.domain.User;
import com.kosign.taskflow.user.repository.UserRepository;
import com.kosign.taskflow.workrequest.domain.Priority;
import com.kosign.taskflow.workrequest.domain.RequestStatus;
import com.kosign.taskflow.workrequest.domain.WorkRequest;
import com.kosign.taskflow.workrequest.dto.CreateWorkRequestRequest;
import com.kosign.taskflow.workrequest.dto.UpdateWorkRequestRequest;
import com.kosign.taskflow.workrequest.dto.WorkRequestResponse;
import com.kosign.taskflow.workrequest.repository.WorkRequestRepository;
import com.kosign.taskflow.workrequest.repository.WorkRequestSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkRequestService {

    private final WorkRequestRepository workRequestRepository;
    private final UserRepository userRepository;

    @Transactional
    public WorkRequestResponse create(CreateWorkRequestRequest request, AuthenticatedUser caller) {
        User requester = loadUser(caller.id());
        User assignee = request.assigneeId() != null ? loadUser(request.assigneeId()) : null;

        WorkRequest wr = WorkRequest.builder()
                .title(request.title())
                .description(request.description())
                .status(RequestStatus.PENDING)
                .priority(request.priority() != null ? request.priority() : Priority.MEDIUM)
                .requester(requester)
                .assignee(assignee)
                .dueDate(request.dueDate())
                .build();

        return WorkRequestResponse.from(workRequestRepository.save(wr));
    }

    @Transactional
    public WorkRequestResponse update(UUID id, UpdateWorkRequestRequest request, AuthenticatedUser caller) {
        WorkRequest wr = loadRequest(id);
        ensureCanEdit(wr, caller);

        if (request.title() != null && !request.title().isBlank()) {
            wr.setTitle(request.title());
        }
        if (request.description() != null) {
            wr.setDescription(request.description());
        }
        if (request.priority() != null) {
            wr.setPriority(request.priority());
        }
        if (request.dueDate() != null) {
            wr.setDueDate(request.dueDate());
        }
        if (request.assigneeId() != null) {
            // Only managers can reassign
            if (caller.role() != Role.MANAGER) {
                throw new AppException(ErrorCode.FORBIDDEN, "Only managers can change assignee");
            }
            wr.setAssignee(loadUser(request.assigneeId()));
        }
        return WorkRequestResponse.from(wr);
    }

    @Transactional
    public WorkRequestResponse changeStatus(UUID id, RequestStatus newStatus, AuthenticatedUser caller) {
        if (caller.role() != Role.MANAGER) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only managers can change status");
        }
        WorkRequest wr = loadRequest(id);
        if (!wr.getStatus().canTransitionTo(newStatus)) {
            throw new AppException(ErrorCode.ILLEGAL_STATUS_TRANSITION,
                    "Cannot transition from %s to %s".formatted(wr.getStatus(), newStatus));
        }
        wr.setStatus(newStatus);
        return WorkRequestResponse.from(wr);
    }

    @Transactional
    public void delete(UUID id, AuthenticatedUser caller) {
        WorkRequest wr = loadRequest(id);
        boolean isOwner = wr.getRequester().getId().equals(caller.id());
        boolean isManager = caller.role() == Role.MANAGER;
        boolean stillPending = wr.getStatus() == RequestStatus.PENDING;
        if (!(isManager || (isOwner && stillPending))) {
            throw new AppException(ErrorCode.FORBIDDEN, "Cannot delete this request");
        }
        workRequestRepository.delete(wr);
    }

    @Transactional(readOnly = true)
    public WorkRequestResponse getById(UUID id, AuthenticatedUser caller) {
        WorkRequest wr = workRequestRepository.findDetailById(id)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_REQUEST_NOT_FOUND, "Work request not found"));
        ensureCanView(wr, caller);
        return WorkRequestResponse.from(wr);
    }

    @Transactional(readOnly = true)
    public Page<WorkRequestResponse> search(
            RequestStatus status,
            Priority priority,
            UUID assigneeId,
            String search,
            Pageable pageable,
            AuthenticatedUser caller
    ) {
        Specification<WorkRequest> spec = WorkRequestSpecifications.filter(status, priority, assigneeId, null, search);

        if (caller.role() == Role.EMPLOYEE) {
            User u = loadUser(caller.id());
            spec = spec.and(WorkRequestSpecifications.ownedBy(u));
        }

        return workRequestRepository.findAll(spec, pageable).map(WorkRequestResponse::from);
    }

    private User loadUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "User not found: " + id));
    }

    private WorkRequest loadRequest(UUID id) {
        return workRequestRepository.findDetailById(id)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_REQUEST_NOT_FOUND, "Work request not found"));
    }

    private void ensureCanView(WorkRequest wr, AuthenticatedUser caller) {
        if (caller.role() == Role.MANAGER) return;
        UUID callerId = caller.id();
        boolean isRequester = wr.getRequester() != null && callerId.equals(wr.getRequester().getId());
        boolean isAssignee  = wr.getAssignee()  != null && callerId.equals(wr.getAssignee().getId());
        if (!isRequester && !isAssignee) {
            throw new AppException(ErrorCode.FORBIDDEN, "Cannot view this request");
        }
    }

    private void ensureCanEdit(WorkRequest wr, AuthenticatedUser caller) {
        if (caller.role() == Role.MANAGER) return;
        if (!wr.getRequester().getId().equals(caller.id())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only the requester or a manager can edit");
        }
        if (wr.getStatus() != RequestStatus.PENDING) {
            throw new AppException(ErrorCode.FORBIDDEN, "Only PENDING requests can be edited by employees");
        }
    }
}
