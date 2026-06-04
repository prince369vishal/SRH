package srh.service.ServiceInterface;

import srh.dto.request.LoginRequest;
import srh.dto.response.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);
}
