package com.service.ServiceImpl;

import com.dto.request.EmployeeRequest;
import com.dto.request.EmployeeUpdateRequest;
import com.dto.response.EmployeeResponse;
import com.entity.Employee;
import com.enums.EmployeeStatus;
import com.repository.EmployeeRepository;
import com.service.ServiceInterface.EmployeeService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public EmployeeResponse saveEmployee(EmployeeRequest request) {
        ensureEmailAvailable(request.getEmail(), null);
        ensureEmployeeCodeAvailable(request.getEmployeeCode(), null);

        Employee employee = new Employee();
        employee.setEmployeeCode(request.getEmployeeCode());
        employee.setEmail(request.getEmail());
        employee.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        employee.setRole(request.getRole());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setDepartment(request.getDepartment());
        employee.setDesignation(request.getDesignation());
        employee.setLocation(request.getLocation());
        employee.setJoiningDate(request.getJoiningDate());
        employee.setStatus(request.getStatus() == null ? EmployeeStatus.ON_BENCH : request.getStatus());
        employee.setBenchStartDate(request.getBenchStartDate());
        employee.setPerformanceManagerId(request.getPerformanceManagerId());
        employee.setActive(request.getActive() == null || request.getActive());
        employee.setSkills(request.getSkills());
        employee.setCertifications(request.getCertifications());
        employee.setProjectHistory(request.getProjectHistory());

        return toResponse(employeeRepository.save(employee));
    }

    @Override
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public EmployeeResponse getEmployeeById(Long id) {
        return toResponse(findEmployeeById(id));
    }

    @Override
    public EmployeeResponse getEmployeeByEmail(String email) {
        return toResponse(findEmployeeByEmail(email));
    }

    @Override
    public EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request) {
        Employee employee = findEmployeeById(id);
        applyAdminUpdates(employee, request);
        return toResponse(employeeRepository.save(employee));
    }

    @Override
    public EmployeeResponse updateOwnProfile(String email, EmployeeUpdateRequest request) {
        Employee employee = findEmployeeByEmail(email);

        if (request.getPhoneNumber() != null) employee.setPhoneNumber(request.getPhoneNumber());
        if (request.getLocation() != null) employee.setLocation(request.getLocation());
        if (request.getSkills() != null) employee.setSkills(request.getSkills());
        if (request.getCertifications() != null) employee.setCertifications(request.getCertifications());

        return toResponse(employeeRepository.save(employee));
    }

    @Override
    public void deleteEmployee(Long id) {
        employeeRepository.delete(findEmployeeById(id));
    }

    private Employee findEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found with id: " + id));
    }

    private Employee findEmployeeByEmail(String email) {
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found with email: " + email));
    }

    private void applyAdminUpdates(Employee employee, EmployeeUpdateRequest request) {
        if (request.getEmployeeCode() != null) {
            ensureEmployeeCodeAvailable(request.getEmployeeCode(), employee.getId());
            employee.setEmployeeCode(request.getEmployeeCode());
        }
        if (request.getEmail() != null) {
            ensureEmailAvailable(request.getEmail(), employee.getId());
            employee.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            employee.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) employee.setRole(request.getRole());
        if (request.getFirstName() != null) employee.setFirstName(request.getFirstName());
        if (request.getLastName() != null) employee.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) employee.setPhoneNumber(request.getPhoneNumber());
        if (request.getDepartment() != null) employee.setDepartment(request.getDepartment());
        if (request.getDesignation() != null) employee.setDesignation(request.getDesignation());
        if (request.getLocation() != null) employee.setLocation(request.getLocation());
        if (request.getJoiningDate() != null) employee.setJoiningDate(request.getJoiningDate());
        if (request.getStatus() != null) employee.setStatus(request.getStatus());
        if (request.getBenchStartDate() != null) employee.setBenchStartDate(request.getBenchStartDate());
        if (request.getPerformanceManagerId() != null) employee.setPerformanceManagerId(request.getPerformanceManagerId());
        if (request.getFirstLogin() != null) employee.setFirstLogin(request.getFirstLogin());
        if (request.getActive() != null) employee.setActive(request.getActive());
        if (request.getSkills() != null) employee.setSkills(request.getSkills());
        if (request.getCertifications() != null) employee.setCertifications(request.getCertifications());
        if (request.getProjectHistory() != null) employee.setProjectHistory(request.getProjectHistory());
    }

    private void ensureEmailAvailable(String email, Long currentEmployeeId) {
        employeeRepository.findByEmail(email)
                .filter(employee -> !Objects.equals(employee.getId(), currentEmployeeId))
                .ifPresent(employee -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee email already exists");
                });
    }

    private void ensureEmployeeCodeAvailable(String employeeCode, Long currentEmployeeId) {
        employeeRepository.findByEmployeeCode(employeeCode)
                .filter(employee -> !Objects.equals(employee.getId(), currentEmployeeId))
                .ifPresent(employee -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee code already exists");
                });
    }

    private EmployeeResponse toResponse(Employee employee) {
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
                employee.getPerformanceManagerId(),
                employee.getFirstLogin(),
                employee.getActive(),
                employee.getSkills(),
                employee.getCertifications(),
                employee.getProjectHistory()
        );
    }
}
