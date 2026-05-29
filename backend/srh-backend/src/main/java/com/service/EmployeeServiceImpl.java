package com.service;

import com.entity.Employee;
import com.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public Employee saveEmployee(Employee employee) {

        try {
            return employeeRepository.save(employee);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}