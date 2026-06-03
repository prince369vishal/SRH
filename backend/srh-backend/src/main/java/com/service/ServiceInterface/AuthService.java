package com.service.ServiceInterface;

import com.dto.request.LoginRequest;
import com.dto.response.LoginResponse;
import org.springframework.http.ResponseEntity;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    ResponseEntity<String> logout(String authHeader);
}