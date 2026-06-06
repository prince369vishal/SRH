package com.service.ServiceImpl;

import com.entity.Employee;
import com.repository.EmployeeRepository;
import com.service.ServiceInterface.EmployeeService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
    public Employee saveEmployee(Employee employee) {

        try {
            if (employee.getPassword() != null && !employee.getPassword().startsWith("$2")) {
                employee.setPassword(passwordEncoder.encode(employee.getPassword()));
            }
            return employeeRepository.save(employee);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
