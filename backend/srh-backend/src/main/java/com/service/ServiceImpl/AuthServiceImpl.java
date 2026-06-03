package com.service.ServiceImpl;

import com.config.JwtUtil;
import com.dto.request.LoginRequest;
import com.dto.response.LoginResponse;
import com.service.ServiceInterface.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final JwtUtil jwtUtil;

    public AuthServiceImpl(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        String token = jwtUtil.generateToken(request.getEmail(), "ADMIN");
        return new LoginResponse(token, "ADMIN", request.getEmail());
    }

    @Override
    public ResponseEntity<String> logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Invalid token format");
        }
        return ResponseEntity.ok("Logged out successfully");
    }
}