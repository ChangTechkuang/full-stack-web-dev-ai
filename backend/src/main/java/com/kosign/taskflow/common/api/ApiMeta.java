package com.kosign.taskflow.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.data.domain.Page;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiMeta(Integer page, Integer size, Long totalElements, Integer totalPages) {

    public static ApiMeta from(Page<?> page) {
        return new ApiMeta(page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }
}
