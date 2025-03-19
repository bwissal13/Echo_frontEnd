package com.yourpackage.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void deleteUser(Long id) {
        // First delete all refresh tokens associated with this user
        refreshTokenRepository.deleteAllByUserId(id);
        
        // Then delete the user
        userRepository.deleteById(id);
    }
} 