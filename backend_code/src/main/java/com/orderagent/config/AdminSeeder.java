package com.orderagent.config;

import com.orderagent.model.Role;
import com.orderagent.model.User;
import com.orderagent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.bootstrap-email}")
    private String bootstrapEmail;

    @Value("${admin.bootstrap-password}")
    private String bootstrapPassword;

    @Override
    public void run(String... args) {
        if (userRepository.existsByRole(Role.ADMIN)) {
            return;
        }

        User admin = new User();
        admin.setEmail(bootstrapEmail);
        admin.setPassword(passwordEncoder.encode(bootstrapPassword));
        admin.setName("Admin");
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        log.warn("Seeded bootstrap ADMIN account ({}). Log in and create real staff accounts via POST /api/staff/users, then change this password.", bootstrapEmail);
    }
}
