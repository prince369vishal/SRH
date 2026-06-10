package com.service.ServiceImpl;

import com.dto.request.EmployeeRequest;
import com.dto.request.EmployeeUpdateRequest;
import com.dto.response.EmployeeResponse;
import com.entity.Employee;
import com.repository.EmployeeRepository;
import com.service.ServiceInterface.EmployeeService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository,
                               PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public EmployeeResponse getEmployeeById(Long id) {
        return toResponse(findEmployeeById(id));
    }

    @Override
    public EmployeeResponse saveEmployee(EmployeeRequest employeeRequest) {
        employeeRepository.findByEmail(employeeRequest.getEmail()).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee email already exists");
        });

        Employee employee = new Employee();
        employee.setName(employeeRequest.getName());
        employee.setEmail(employeeRequest.getEmail());
        employee.setPassword(passwordEncoder.encode(employeeRequest.getPassword()));
        employee.setRole(employeeRequest.getRole());
        employee.setSkills(employeeRequest.getSkills());
        employee.setExperienceYears(employeeRequest.getExperienceYears());

        return toResponse(employeeRepository.save(employee));
    }

    @Override
    public EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest employeeRequest) {
        Employee employee = findEmployeeById(id);

        if (employeeRequest.getEmail() != null && !employeeRequest.getEmail().equals(employee.getEmail())) {
            employeeRepository.findByEmail(employeeRequest.getEmail()).ifPresent(existing -> {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee email already exists");
            });
            employee.setEmail(employeeRequest.getEmail());
        }

        if (employeeRequest.getName() != null) employee.setName(employeeRequest.getName());
        if (employeeRequest.getRole() != null) employee.setRole(employeeRequest.getRole());
        if (employeeRequest.getSkills() != null) employee.setSkills(employeeRequest.getSkills());
        if (employeeRequest.getExperienceYears() != null) employee.setExperienceYears(employeeRequest.getExperienceYears());

        if (employeeRequest.getPassword() != null && !employeeRequest.getPassword().isBlank()) {
            employee.setPassword(passwordEncoder.encode(employeeRequest.getPassword()));
        }

        return toResponse(employeeRepository.save(employee));
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee employee = findEmployeeById(id);
        employeeRepository.delete(employee);
    }

    private Employee findEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
    }

    private EmployeeResponse toResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getRole(),
                employee.getSkills(),
                employee.getExperienceYears()
        );
    }
}