package com.service.ServiceInterface;

import com.dto.request.ProjectRequest;
import com.dto.response.EmployeeResponse;
import com.dto.response.ProjectResponse;

import java.util.List;

public interface ProjectService {
    ProjectResponse createProject(ProjectRequest request, String createdByEmail);
    List<ProjectResponse> getAllProjects();
    ProjectResponse getProjectById(Long id);
    ProjectResponse updateProject(Long id, ProjectRequest request);
    void deleteProject(Long id);
    // Returns employees whose skills + experience match a given requirement
    List<EmployeeResponse> getMatchingEmployees(Long projectId, Long requirementId);
    // Assign specific employees to a requirement
    ProjectResponse assignEmployees(Long projectId, Long requirementId, List<Long> employeeIds);
}