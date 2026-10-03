package com.orderagent.service;

import com.orderagent.dto.AuthResponse;
import com.orderagent.dto.CreateStaffRequest;
import com.orderagent.dto.LoginRequest;
import com.orderagent.dto.RegisterRequest;
import com.orderagent.exception.BadRequestException;
import com.orderagent.exception.ConflictException;
import com.orderagent.exception.UnauthorizedException;
import com.orderagent.model.Role;
import com.orderagent.model.User;
import com.orderagent.repository.UserRepository;
import com.orderagent.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(Role.CUSTOMER);
        userRepository.save(user);

        return toAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        return toAuthResponse(user);
    }

    // ADMIN-only — see StaffUserController. Not exposed for public self-registration.
    public AuthResponse createStaff(CreateStaffRequest request) {
        if (request.getRole() == Role.CUSTOMER) {
            throw new BadRequestException("Use /api/auth/register for customer accounts");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(request.getRole());
        userRepository.save(user);

        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
