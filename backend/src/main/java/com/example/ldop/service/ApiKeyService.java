package com.example.ldop.service;

import com.example.ldop.constant.AppConstants;
import com.example.ldop.domain.ApiKey;
import com.example.ldop.repository.ApiKeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

    private static final String PREFIX = "ldop_sk_";
    private static final int SECRET_LENGTH = 16;

    @Transactional
    public String generateApiKey(String tenantId, String name, LocalDateTime expiresAt) {
        UUID id = UUID.randomUUID();
        byte[] secretBytes = new byte[SECRET_LENGTH];
        secureRandom.nextBytes(secretBytes);
        
        String idPart = Base64.getUrlEncoder().withoutPadding().encodeToString(asBytes(id));
        String secretPart = Base64.getUrlEncoder().withoutPadding().encodeToString(secretBytes);
        
        String rawKey = PREFIX + idPart + "." + secretPart;
        String keyHash = passwordEncoder.encode(rawKey);

        ApiKey apiKey = ApiKey.builder()
                .id(id)
                .tenantId(tenantId)
                .name(name)
                .keyHash(keyHash)
                .prefix(PREFIX)
                .status(AppConstants.STATUS_ACTIVE)
                .expiresAt(expiresAt)
                .build();

        apiKeyRepository.save(apiKey);

        return rawKey;
    }

    public Optional<ApiKey> validateApiKey(String rawKey) {
        if (rawKey == null || !rawKey.startsWith(PREFIX)) {
            return Optional.empty();
        }

        try {
            // Format: ldop_sk_<id>.<secret>
            String content = rawKey.substring(PREFIX.length());
            String[] parts = content.split("\\.");
            if (parts.length != 2) {
                return Optional.empty();
            }

            String idPart = parts[0];
            UUID id = asUuid(Base64.getUrlDecoder().decode(idPart));

            return apiKeyRepository.findById(id)
                    .filter(apiKey -> AppConstants.STATUS_ACTIVE.equals(apiKey.getStatus()))
                    .filter(apiKey -> apiKey.getExpiresAt() == null || apiKey.getExpiresAt().isAfter(LocalDateTime.now()))
                    .filter(apiKey -> passwordEncoder.matches(rawKey, apiKey.getKeyHash()))
                    .map(apiKey -> {
                        // Update last used asynchronously (or sync for now)
                        apiKey.setLastUsedAt(LocalDateTime.now());
                        apiKeyRepository.save(apiKey);
                        return apiKey;
                    });

        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    @Transactional
    public void revokeApiKey(UUID id) {
        apiKeyRepository.findById(id).ifPresent(apiKey -> {
            apiKey.setStatus(AppConstants.STATUS_REVOKED);
            apiKeyRepository.save(apiKey);
        });
    }

    public List<ApiKey> getApiKeysByTenant(String tenantId) {
        return apiKeyRepository.findByTenantId(tenantId);
    }

    public List<ApiKey> getApiKeysByTenantAndStatus(String tenantId, String status) {
        return apiKeyRepository.findByTenantId(tenantId).stream()
                .filter(apiKey -> status.equals(apiKey.getStatus()))
                .collect(java.util.stream.Collectors.toList());
    }

    public Optional<ApiKey> getApiKeyById(UUID id) {
        return apiKeyRepository.findById(id);
    }

    @Transactional
    public void deleteApiKey(UUID id) {
        apiKeyRepository.deleteById(id);
    }

    // Helper to convert UUID to byte[]
    private static byte[] asBytes(UUID uuid) {
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
        return bb.array();
    }

    // Helper to convert byte[] to UUID
    private static UUID asUuid(byte[] bytes) {
        ByteBuffer bb = ByteBuffer.wrap(bytes);
        long firstLong = bb.getLong();
        long secondLong = bb.getLong();
        return new UUID(firstLong, secondLong);
    }
}
