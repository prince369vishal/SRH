package com.service.ServiceImpl;

import com.dto.request.DemandProjectRequest;
import com.dto.request.ShortlistRequest;
import com.dto.response.DemandProjectResponse;
import com.dto.response.EmployeeResponse;
import com.entity.DemandProject;
import com.entity.Employee;
import com.enums.EmployeeStatus;
import com.enums.ProjectStatus;
import com.repository.DemandProjectRepository;
import com.repository.EmployeeRepository;
import com.service.ServiceInterface.DemandProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class DemandProjectServiceImpl implements DemandProjectService {

    private final DemandProjectRepository demandProjectRepository;
    private final EmployeeRepository employeeRepository;

    public DemandProjectServiceImpl(DemandProjectRepository demandProjectRepository, EmployeeRepository employeeRepository) {
        this.demandProjectRepository = demandProjectRepository;
        this.employeeRepository = employeeRepository;
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

    @Override
    public List<EmployeeResponse> getMatchedEmployees(Long projectId) {
        DemandProject project = findProjectById(projectId);
        List<String> requiredSkills = project.getRequiredSkills();

        if (requiredSkills == null || requiredSkills.isEmpty()) {
            return List.of();
        }

        Set<String> requiredSkillsLower = requiredSkills.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<Employee> benchEmployees = employeeRepository.findByStatus(EmployeeStatus.ON_BENCH);

        return benchEmployees.stream()
                .filter(employee -> employee.getSkills() != null && employee.getSkills().stream()
                        .anyMatch(skill -> requiredSkillsLower.contains(skill.getSkillName().toLowerCase())))
                .map(this::toEmployeeResponse)
                .toList();
    }

    @Override
    public List<EmployeeResponse> shortlistEmployees(Long projectId, ShortlistRequest request) {
        findProjectById(projectId);

        List<Employee> employees = employeeRepository.findAllById(request.getEmployeeIds());

        if (employees.size() != request.getEmployeeIds().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more employee IDs are invalid");
        }

        for (Employee employee : employees) {
            if (employee.getStatus() != EmployeeStatus.ON_BENCH) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Employee " + employee.getEmployeeCode() + " is not ON_BENCH (current status: " + employee.getStatus() + ")");
            }
        }

        employees.forEach(employee -> employee.setStatus(EmployeeStatus.SHORTLISTED));
        List<Employee> savedEmployees = employeeRepository.saveAll(employees);

        return savedEmployees.stream()
                .map(this::toEmployeeResponse)
                .toList();
    }

    private EmployeeResponse toEmployeeResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getEmail(),
                employee.getRole(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getPhoneNumber(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getLocation(),
                employee.getJoiningDate(),
                employee.getStatus(),
                employee.getBenchStartDate(),
                employee.getManagerId(),
                employee.getExperienceYears(),
                employee.getFirstLogin(),
                employee.getActive(),
                employee.getSkills(),
                employee.getCertifications(),
                employee.getProjectHistory()
        );
    }
}
