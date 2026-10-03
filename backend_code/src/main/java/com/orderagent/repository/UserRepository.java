package com.orderagent.repository;

import com.orderagent.model.Role;
import com.orderagent.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByRole(Role role);
}
