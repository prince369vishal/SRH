package com.service.ServiceInterface;

import com.dto.request.DemandProjectRequest;
import com.dto.request.ShortlistRequest;
import com.dto.response.DemandProjectResponse;
import com.dto.response.EmployeeResponse;
import java.util.List;

public interface DemandProjectService {

    DemandProjectResponse createProject(DemandProjectRequest request);

    List<DemandProjectResponse> getAllProjects();

    DemandProjectResponse getProjectById(Long id);

    DemandProjectResponse updateProject(Long id, DemandProjectRequest request);

    void deleteProject(Long id);

    List<EmployeeResponse> getMatchedEmployees(Long projectId);

    List<EmployeeResponse> shortlistEmployees(Long projectId, ShortlistRequest request);
}
