package com.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee,Long> {

}
