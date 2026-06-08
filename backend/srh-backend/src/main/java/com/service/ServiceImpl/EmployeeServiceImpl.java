package com.service.ServiceImpl;

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
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
    }

    @Override
    public Employee saveEmployee(Employee employee) {
        encodePasswordIfPresent(employee);
        return employeeRepository.save(employee);
    }

    @Override
    public Employee updateEmployee(Long id, Employee updatedEmployee) {
        Employee employee = getEmployeeById(id);
        employee.setName(updatedEmployee.getName());
        employee.setEmail(updatedEmployee.getEmail());
        employee.setRole(updatedEmployee.getRole());

        if (updatedEmployee.getPassword() != null && !updatedEmployee.getPassword().isBlank()) {
            employee.setPassword(updatedEmployee.getPassword());
            encodePasswordIfPresent(employee);
        }

        return employeeRepository.save(employee);
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employeeRepository.delete(employee);
    }

    private void encodePasswordIfPresent(Employee employee) {
        if (employee.getPassword() != null && !employee.getPassword().startsWith("$2")) {
            employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        }
    }
}
