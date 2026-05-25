package com.kosign.taskflow.workrequest.repository;

import com.kosign.taskflow.user.domain.User;
import com.kosign.taskflow.workrequest.domain.Priority;
import com.kosign.taskflow.workrequest.domain.RequestStatus;
import com.kosign.taskflow.workrequest.domain.WorkRequest;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class WorkRequestSpecifications {

    private WorkRequestSpecifications() {}

    public static Specification<WorkRequest> filter(
            RequestStatus status,
            Priority priority,
            UUID assigneeId,
            UUID requesterId,
            String search
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (assigneeId != null) {
                predicates.add(cb.equal(root.get("assignee").get("id"), assigneeId));
            }
            if (requesterId != null) {
                predicates.add(cb.equal(root.get("requester").get("id"), requesterId));
            }
            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (query != null && Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("requester", jakarta.persistence.criteria.JoinType.LEFT);
                root.fetch("assignee", jakarta.persistence.criteria.JoinType.LEFT);
                query.distinct(true);
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<WorkRequest> ownedBy(User user) {
        return (root, query, cb) -> cb.or(
                cb.equal(root.get("requester").get("id"), user.getId()),
                cb.equal(root.get("assignee").get("id"), user.getId())
        );
    }
}
