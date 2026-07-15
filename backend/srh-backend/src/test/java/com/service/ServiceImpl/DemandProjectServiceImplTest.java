package com.service.ServiceImpl;

import com.dto.request.DemandProjectRequest;
import com.dto.response.DemandProjectResponse;
import com.entity.DemandProject;
import com.enums.ProjectStatus;
import com.repository.DemandProjectRepository;
import com.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DemandProjectServiceImplTest {

    @Mock
    private DemandProjectRepository demandProjectRepository;
    private EmployeeRepository employeeRepository;

    private DemandProjectServiceImpl demandProjectService;

    @BeforeEach
    void setUp() {
        demandProjectService = new DemandProjectServiceImpl(demandProjectRepository, employeeRepository);
    }

    // ─── createProject ────────────────────────────────────────────────────────

    @Test
    void createProjectSavesEntityAndReturnsResponse() {
        DemandProjectRequest request = request("Retail Banking", "Desc",
                List.of("Java", "Spring"), new BigDecimal("4.5"), 3,
                "Engineering", "Mumbai", ProjectStatus.OPEN);

        DemandProject saved = savedProject(1L, request, ProjectStatus.OPEN);
        when(demandProjectRepository.save(any(DemandProject.class))).thenReturn(saved);

        DemandProjectResponse response = demandProjectService.createProject(request);

        assertEquals(1L, response.getId());
        assertEquals("Retail Banking", response.getProjectName());
        assertEquals("Desc", response.getDescription());
        assertEquals(List.of("Java", "Spring"), response.getRequiredSkills());
        assertEquals(new BigDecimal("4.5"), response.getRequiredExperience());
        assertEquals(3, response.getNumberOfResourcesRequired());
        assertEquals("Engineering", response.getDepartment());
        assertEquals("Mumbai", response.getLocation());
        assertEquals(ProjectStatus.OPEN, response.getStatus());
        verify(demandProjectRepository).save(any(DemandProject.class));
    }

    @Test
    void createProjectDefaultsStatusToOpenWhenNull() {
        DemandProjectRequest request = request("Project X", null, null, null, 2, null, null, null);

        ArgumentCaptor<DemandProject> captor = ArgumentCaptor.forClass(DemandProject.class);
        DemandProject saved = savedProject(1L, request, ProjectStatus.OPEN);
        when(demandProjectRepository.save(captor.capture())).thenReturn(saved);

        demandProjectService.createProject(request);

        assertEquals(ProjectStatus.OPEN, captor.getValue().getStatus());
    }

    @Test
    void createProjectDefaultsRequiredSkillsToEmptyListWhenNull() {
        DemandProjectRequest request = request("Project Y", null, null, null, 1, null, null, ProjectStatus.OPEN);

        ArgumentCaptor<DemandProject> captor = ArgumentCaptor.forClass(DemandProject.class);
        DemandProject saved = savedProject(1L, request, ProjectStatus.OPEN);
        when(demandProjectRepository.save(captor.capture())).thenReturn(saved);

        demandProjectService.createProject(request);

        assertNotNull(captor.getValue().getRequiredSkills());
        assertTrue(captor.getValue().getRequiredSkills().isEmpty());
    }

    // ─── getAllProjects ────────────────────────────────────────────────────────

    @Test
    void getAllProjectsReturnsAllMappedResponses() {
        DemandProject p1 = savedProject(1L, request("P1", null, null, null, 1, null, null, ProjectStatus.OPEN), ProjectStatus.OPEN);
        DemandProject p2 = savedProject(2L, request("P2", null, null, null, 2, null, null, ProjectStatus.IN_PROGRESS), ProjectStatus.IN_PROGRESS);
        when(demandProjectRepository.findAll()).thenReturn(List.of(p1, p2));

        List<DemandProjectResponse> responses = demandProjectService.getAllProjects();

        assertEquals(2, responses.size());
        assertEquals("P1", responses.get(0).getProjectName());
        assertEquals("P2", responses.get(1).getProjectName());
    }

    @Test
    void getAllProjectsReturnsEmptyListWhenNoneExist() {
        when(demandProjectRepository.findAll()).thenReturn(List.of());

        assertTrue(demandProjectService.getAllProjects().isEmpty());
    }

    // ─── getProjectById ───────────────────────────────────────────────────────

    @Test
    void getProjectByIdReturnsResponseWhenFound() {
        DemandProject project = savedProject(5L, request("Found", null, null, null, 1, null, null, ProjectStatus.OPEN), ProjectStatus.OPEN);
        when(demandProjectRepository.findById(5L)).thenReturn(Optional.of(project));

        DemandProjectResponse response = demandProjectService.getProjectById(5L);

        assertEquals(5L, response.getId());
        assertEquals("Found", response.getProjectName());
    }

    @Test
    void getProjectByIdThrowsNotFoundWhenMissing() {
        when(demandProjectRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> demandProjectService.getProjectById(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        assertTrue(ex.getReason().contains("99"));
    }

    // ─── updateProject ────────────────────────────────────────────────────────

    @Test
    void updateProjectAppliesChangesAndReturnsUpdatedResponse() {
        DemandProject existing = savedProject(3L,
                request("Old Name", null, null, null, 1, null, null, ProjectStatus.OPEN), ProjectStatus.OPEN);
        DemandProjectRequest updateRequest = request("New Name", "New Desc",
                List.of("Python"), new BigDecimal("3.0"), 5, "HR", "Delhi", ProjectStatus.FULFILLED);

        DemandProject updated = savedProject(3L, updateRequest, ProjectStatus.FULFILLED);
        when(demandProjectRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(demandProjectRepository.save(existing)).thenReturn(updated);

        DemandProjectResponse response = demandProjectService.updateProject(3L, updateRequest);

        assertEquals("New Name", response.getProjectName());
        assertEquals("New Desc", response.getDescription());
        assertEquals(ProjectStatus.FULFILLED, response.getStatus());
        assertEquals(5, response.getNumberOfResourcesRequired());
        verify(demandProjectRepository).save(existing);
    }

    @Test
    void updateProjectThrowsNotFoundWhenProjectMissing() {
        when(demandProjectRepository.findById(42L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> demandProjectService.updateProject(42L,
                        request("X", null, null, null, 1, null, null, null)));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void updateProjectDefaultsStatusToOpenWhenRequestStatusIsNull() {
        DemandProject existing = savedProject(4L,
                request("P", null, null, null, 1, null, null, ProjectStatus.OPEN), ProjectStatus.OPEN);
        DemandProjectRequest updateRequest = request("P Updated", null, null, null, 2, null, null, null);

        ArgumentCaptor<DemandProject> captor = ArgumentCaptor.forClass(DemandProject.class);
        when(demandProjectRepository.findById(4L)).thenReturn(Optional.of(existing));
        when(demandProjectRepository.save(captor.capture())).thenReturn(existing);

        demandProjectService.updateProject(4L, updateRequest);

        assertEquals(ProjectStatus.OPEN, captor.getValue().getStatus());
    }

    // ─── deleteProject ────────────────────────────────────────────────────────

    @Test
    void deleteProjectLoadsThenDeletesEntity() {
        DemandProject project = savedProject(7L,
                request("ToDelete", null, null, null, 1, null, null, ProjectStatus.OPEN), ProjectStatus.OPEN);
        when(demandProjectRepository.findById(7L)).thenReturn(Optional.of(project));

        demandProjectService.deleteProject(7L);

        verify(demandProjectRepository).delete(project);
    }

    @Test
    void deleteProjectThrowsNotFoundWhenProjectMissing() {
        when(demandProjectRepository.findById(55L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> demandProjectService.deleteProject(55L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(demandProjectRepository, never()).delete(any());
    }

    // ─── helpers ──────────────────────────────────────────────────────────────

    private DemandProjectRequest request(String projectName, String description, List<String> skills,
                                          BigDecimal experience, int resources, String department,
                                          String location, ProjectStatus status) {
        DemandProjectRequest r = new DemandProjectRequest();
        r.setProjectName(projectName);
        r.setDescription(description);
        r.setRequiredSkills(skills);
        r.setRequiredExperience(experience);
        r.setNumberOfResourcesRequired(resources);
        r.setDepartment(department);
        r.setLocation(location);
        r.setStatus(status);
        return r;
    }

    private DemandProject savedProject(Long id, DemandProjectRequest request, ProjectStatus resolvedStatus) {
        DemandProject p = new DemandProject();
        p.setId(id);
        p.setProjectName(request.getProjectName());
        p.setDescription(request.getDescription());
        p.setRequiredSkills(request.getRequiredSkills() != null ? request.getRequiredSkills() : List.of());
        p.setRequiredExperience(request.getRequiredExperience());
        p.setNumberOfResourcesRequired(request.getNumberOfResourcesRequired());
        p.setDepartment(request.getDepartment());
        p.setLocation(request.getLocation());
        p.setStatus(resolvedStatus);
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());
        return p;
    }
}
