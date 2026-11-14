package com.example.essayscoring.config;

import com.example.essayscoring.entity.Role;
import com.example.essayscoring.entity.User;
import com.example.essayscoring.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedAdmin(UserRepository users, PasswordEncoder encoder,
                                @Value("${app.admin.username}") String username,
                                @Value("${app.admin.password}") String password) {
        return args -> {
            if (!users.existsByUsername(username)) {
                User admin = new User();
                admin.setUsername(username);
                admin.setPasswordHash(encoder.encode(password));
                admin.setRole(Role.ADMIN);
                users.save(admin);
            }
        };
    }
}