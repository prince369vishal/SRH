package srh.service.ServiceImpl;

import srh.dto.request.LoginRequest;
import srh.dto.response.LoginResponse;
import srh.service.ServiceInterface.AuthService;
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
