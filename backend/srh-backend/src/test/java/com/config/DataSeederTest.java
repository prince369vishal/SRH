package com.config;

import com.entity.Employee;
import com.enums.Role;
import com.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DataSeederTest {

    @Test
    void createsDefaultAdminWhenMissing() throws Exception {
        EmployeeRepository repository = mock(EmployeeRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        JdbcTemplate template = mock(JdbcTemplate.class);
        when(repository.findByEmail("admin@example.com")).thenReturn(Optional.empty());
        when(repository.findByEmail("operator@example.com")).thenReturn(Optional.empty());
        when(repository.findByEmail("project.admin@example.com")).thenReturn(Optional.empty());
        when(encoder.encode(anyString())).thenReturn("$2encoded");

        CommandLineRunner runner = new DataSeeder().seedAdmin(repository, encoder, template);
        runner.run();

        verify(repository).save(argThat(employee ->
                employee.getFirstName().equals("Admin")
                        && employee.getLastName().equals("User")
                        && employee.getEmail().equals("admin@example.com")
                        && employee.getPasswordHash().equals("$2encoded")
                        && employee.getRole() == Role.ADMIN));
    }

    @Test
    void leavesExistingAdminUntouched() throws Exception {
        EmployeeRepository repository = mock(EmployeeRepository.class);
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        JdbcTemplate template = mock(JdbcTemplate.class);
        when(repository.findByEmail("admin@example.com")).thenReturn(Optional.of(new Employee()));
        when(repository.findByEmail("operator@example.com")).thenReturn(Optional.of(new Employee()));
        when(repository.findByEmail("project.admin@example.com")).thenReturn(Optional.of(new Employee()));

        new DataSeeder().seedAdmin(repository, encoder, template).run();

        verify(repository, never()).save(any());
        verifyNoInteractions(encoder);
    }
}

