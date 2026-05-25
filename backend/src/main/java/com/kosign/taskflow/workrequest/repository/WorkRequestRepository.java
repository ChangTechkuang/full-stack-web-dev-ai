package com.kosign.taskflow.workrequest.repository;

import com.kosign.taskflow.workrequest.domain.WorkRequest;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface WorkRequestRepository
        extends JpaRepository<WorkRequest, UUID>, JpaSpecificationExecutor<WorkRequest> {

    @EntityGraph(attributePaths = {"requester", "assignee"})
    @Query("select wr from WorkRequest wr where wr.id = :id")
    Optional<WorkRequest> findDetailById(@Param("id") UUID id);
}
