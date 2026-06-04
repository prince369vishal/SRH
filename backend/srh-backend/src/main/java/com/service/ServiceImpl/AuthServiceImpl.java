package com.service.ServiceImpl;

import com.dto.request.LoginRequest;
import com.dto.response.LoginResponse;
import com.service.ServiceInterface.AuthService;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {


    @Override
    public LoginResponse login(LoginRequest request) {
        return new LoginResponse(
                "vishal",
                "ADMIN",
                request.getEmail()

        );
    }
}
