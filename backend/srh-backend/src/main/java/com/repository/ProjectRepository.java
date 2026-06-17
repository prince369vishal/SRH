// ─── ProjectRepository.java ───────────────────────────────────────────────────
package com.repository;

import com.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCreatedBy(String createdBy);
    List<Project> findByStatus(String status);
}