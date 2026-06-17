package com.service.ServiceImpl;

import com.dto.request.DemandProjectRequest;
import com.dto.response.DemandProjectResponse;
import com.entity.DemandProject;
import com.enums.ProjectStatus;
import com.repository.DemandProjectRepository;
import com.service.ServiceInterface.DemandProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class DemandProjectServiceImpl implements DemandProjectService {

    private final DemandProjectRepository demandProjectRepository;

    public DemandProjectServiceImpl(DemandProjectRepository demandProjectRepository) {
        this.demandProjectRepository = demandProjectRepository;
    }

    @Override
    public DemandProjectResponse createProject(DemandProjectRequest request) {
        DemandProject project = new DemandProject();
        applyRequest(project, request);
        return toResponse(demandProjectRepository.save(project));
    }

    @Override
    public List<DemandProjectResponse> getAllProjects() {
        return demandProjectRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public DemandProjectResponse getProjectById(Long id) {
        return toResponse(findProjectById(id));
    }

    @Override
    public DemandProjectResponse updateProject(Long id, DemandProjectRequest request) {
        DemandProject project = findProjectById(id);
        applyRequest(project, request);
        return toResponse(demandProjectRepository.save(project));
    }

    @Override
    public void deleteProject(Long id) {
        demandProjectRepository.delete(findProjectById(id));
    }

    private DemandProject findProjectById(Long id) {
        return demandProjectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found with id: " + id));
    }

    private void applyRequest(DemandProject project, DemandProjectRequest request) {
        project.setProjectName(request.getProjectName());
        project.setDescription(request.getDescription());
        project.setRequiredSkills(request.getRequiredSkills() == null ? new ArrayList<>() : request.getRequiredSkills());
        project.setRequiredExperience(request.getRequiredExperience());
        project.setNumberOfResourcesRequired(request.getNumberOfResourcesRequired());
        project.setDepartment(request.getDepartment());
        project.setLocation(request.getLocation());
        project.setStatus(request.getStatus() == null ? ProjectStatus.OPEN : request.getStatus());
    }

    private DemandProjectResponse toResponse(DemandProject project) {
        return new DemandProjectResponse(
                project.getId(),
                project.getProjectName(),
                project.getDescription(),
                project.getRequiredSkills(),
                project.getRequiredExperience(),
                project.getNumberOfResourcesRequired(),
                project.getDepartment(),
                project.getLocation(),
                project.getStatus(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
