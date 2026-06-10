package com.config;

import com.entity.Employee;
import com.enums.Role;
import com.repository.EmployeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedAdmin(EmployeeRepository employeeRepository,
                                       PasswordEncoder passwordEncoder) {
        return args -> employeeRepository.findByEmail("admin@example.com")
                .orElseGet(() -> {
                    Employee admin = new Employee();
                    admin.setEmployeeCode("ADMIN-001");
                    admin.setEmail("admin@example.com");
                    admin.setPasswordHash(passwordEncoder.encode("admin123"));
                    admin.setRole(Role.ADMIN);
                    admin.setFirstName("Admin");
                    admin.setLastName("User");
                    admin.setDepartment("Administration");
                    admin.setDesignation("System Administrator");
                    admin.setLocation("Bangalore");
                    admin.setActive(true);
                    admin.setFirstLogin(false);
                    return employeeRepository.save(admin);
                });
    }
}
