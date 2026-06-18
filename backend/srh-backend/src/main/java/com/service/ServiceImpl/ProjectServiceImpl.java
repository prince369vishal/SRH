package com.service.ServiceImpl;

import com.dto.request.ProjectRequest;
import com.dto.request.ProjectRequirementRequest;
import com.dto.response.EmployeeResponse;
import com.dto.response.ProjectRequirementResponse;
import com.dto.response.ProjectResponse;
import com.entity.Employee;
import com.entity.Project;
import com.entity.ProjectRequirement;
import com.enums.EmployeeStatus;
import com.repository.EmployeeRepository;
import com.repository.ProjectRepository;
import com.service.ServiceInterface.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository,
                              EmployeeRepository employeeRepository) {
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    public ProjectResponse createProject(ProjectRequest request, String createdByEmail) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus("OPEN");
        project.setCreatedBy(createdByEmail);

        List<ProjectRequirement> requirements = request.getRequirements().stream()
                .map(r -> buildRequirement(r, project))
                .collect(Collectors.toList());

        project.setRequirements(requirements);
        return toResponse(projectRepository.save(project));
    }

    @Override
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse getProjectById(Long id) {
        return toResponse(findProject(id));
    }

    @Override
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = findProject(id);
        project.setName(request.getName());
        project.setDescription(request.getDescription());

        // Replace all requirements
        project.getRequirements().clear();
        request.getRequirements().stream()
                .map(r -> buildRequirement(r, project))
                .forEach(project.getRequirements()::add);

        return toResponse(projectRepository.save(project));
    }

    @Override
    public void deleteProject(Long id) {
        Project project = findProject(id);
        projectRepository.delete(project);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getMatchingEmployees(Long projectId, Long requirementId) {
        Project project = findProject(projectId);

        ProjectRequirement requirement = project.getRequirements().stream()
                .filter(r -> r.getId().equals(requirementId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Requirement not found"));

        Set<String> requiredSkills = Arrays.stream(requirement.getRequiredSkills().split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        int minExp = requirement.getMinExperienceYears();
        Set<Long> shortlistedEmployeeIds = parseEmployeeIds(requirement.getAssignedEmployeeIds());

        return employeeRepository.findAll().stream()
                .filter(emp -> emp.getSkills() != null && emp.getExperienceYears() != null)
                .filter(emp -> emp.getStatus() == EmployeeStatus.ON_BENCH
                        || shortlistedEmployeeIds.contains(emp.getId()))
                .filter(emp -> emp.getExperienceYears()
                        .compareTo(BigDecimal.valueOf(minExp)) >= 0)
                .filter(emp -> {
                    Set<String> empSkills = emp.getSkills().stream()
                            .map(skill -> skill.getSkillName() == null ? "" : skill.getSkillName().trim().toLowerCase())
                            .filter(skill -> !skill.isBlank())
                            .collect(Collectors.toSet());

                    return empSkills.containsAll(requiredSkills);
                })
                .map(this::toEmployeeResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProjectResponse shortlistEmployees(Long projectId, Long requirementId, List<Long> employeeIds) {
        Project project = findProject(projectId);

        ProjectRequirement requirement = project.getRequirements().stream()
                .filter(r -> r.getId().equals(requirementId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Requirement not found"));

        Set<Long> selectedIds = employeeIds == null
                ? Set.of()
                : new HashSet<>(employeeIds);

        List<Employee> selectedEmployees = employeeRepository.findAllById(selectedIds);
        if (selectedEmployees.size() != selectedIds.size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "One or more selected employees were not found");
        }

        Set<Long> alreadyShortlistedForRequirement = parseEmployeeIds(requirement.getAssignedEmployeeIds());
        selectedEmployees.forEach(employee -> {
            if (employee.getStatus() == EmployeeStatus.ON_BENCH) {
                employee.setStatus(EmployeeStatus.SHORTLISTED);
            } else if (!alreadyShortlistedForRequirement.contains(employee.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Employee " + employee.getId() + " is not on bench");
            }
        });

        String ids = selectedIds.stream()
                .sorted()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
        requirement.setAssignedEmployeeIds(ids);

        employeeRepository.saveAll(selectedEmployees);
        projectRepository.save(project);
        return toResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse assignEmployees(Long projectId, Long requirementId, List<Long> employeeIds) {
        return shortlistEmployees(projectId, requirementId, employeeIds);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Project not found"));
    }

    private ProjectRequirement buildRequirement(ProjectRequirementRequest r, Project project) {
        ProjectRequirement req = new ProjectRequirement();
        req.setRoleName(r.getRoleName());
        req.setRequiredSkills(r.getRequiredSkills());
        req.setMinExperienceYears(r.getMinExperienceYears());
        req.setNumberOfPeople(r.getNumberOfPeople());
        req.setProject(project);
        return req;
    }

    private Set<Long> parseEmployeeIds(String value) {
        if (value == null || value.isBlank()) {
            return Set.of();
        }

        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(id -> !id.isBlank())
                .map(Long::valueOf)
                .collect(Collectors.toSet());
    }

    private ProjectResponse toResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setStatus(project.getStatus());
        response.setCreatedAt(project.getCreatedAt());
        response.setCreatedBy(project.getCreatedBy());

        List<ProjectRequirementResponse> reqs = project.getRequirements().stream()
                .map(r -> {
                    ProjectRequirementResponse rr = new ProjectRequirementResponse();
                    rr.setId(r.getId());
                    rr.setRoleName(r.getRoleName());
                    rr.setRequiredSkills(r.getRequiredSkills());
                    rr.setMinExperienceYears(r.getMinExperienceYears());
                    rr.setNumberOfPeople(r.getNumberOfPeople());
                    rr.setAssignedEmployeeIds(r.getAssignedEmployeeIds());
                    return rr;
                })
                .collect(Collectors.toList());

        response.setRequirements(reqs);
        return response;
    }

    private EmployeeResponse toEmployeeResponse(Employee e) {
        return new EmployeeResponse(
                e.getId(),
                e.getEmployeeCode(),
                e.getEmail(),
                e.getRole(),
                e.getFirstName(),
                e.getLastName(),
                e.getPhoneNumber(),
                e.getDepartment(),
                e.getDesignation(),
                e.getLocation(),
                e.getJoiningDate(),
                e.getStatus(),
                e.getBenchStartDate(),
                e.getManagerId(),
                e.getExperienceYears(),
                e.getFirstLogin(),
                e.getActive(),
                e.getSkills(),
                e.getCertifications(),
                e.getProjectHistory()
        );
    }
}
