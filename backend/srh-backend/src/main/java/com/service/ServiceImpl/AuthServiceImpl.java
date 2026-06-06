package com.service.ServiceImpl;

import com.config.JwtUtil;
import com.dto.request.LoginRequest;
import com.dto.response.LoginResponse;
import com.entity.Employee;
import com.repository.EmployeeRepository;
import com.service.ServiceInterface.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthServiceImpl implements AuthService {

    private final JwtUtil jwtUtil;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(JwtUtil jwtUtil,
                           EmployeeRepository employeeRepository,
                           PasswordEncoder passwordEncoder) {
        this.jwtUtil = jwtUtil;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Employee employee = employeeRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        String storedPassword = employee.getPassword();
        boolean isBcryptPassword = storedPassword != null && storedPassword.startsWith("$2");
        boolean passwordMatches = isBcryptPassword
                ? passwordEncoder.matches(request.getPassword(), storedPassword)
                : request.getPassword().equals(storedPassword);

        if (!passwordMatches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (!isBcryptPassword) {
            employee.setPassword(passwordEncoder.encode(request.getPassword()));
            employeeRepository.save(employee);
        }

        String role = employee.getRole().name();
        String token = jwtUtil.generateToken(employee.getEmail(), role);
        return new LoginResponse(token, role, employee.getEmail());
    }

    @Override
    public ResponseEntity<String> logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Invalid token format");
        }
        return ResponseEntity.ok("Logged out successfully");
    }
}
