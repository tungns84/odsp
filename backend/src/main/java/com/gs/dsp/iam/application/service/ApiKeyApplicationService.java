package com.gs.dsp.iam.application.service;

import com.gs.dsp.shared.kernel.constants.AppConstants;
import com.gs.dsp.iam.domain.model.ApiKey;
import com.gs.dsp.iam.domain.model.ApiKeyId;
import com.gs.dsp.iam.domain.model.TenantId;
import com.gs.dsp.iam.domain.repository.ApiKeyRepository;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApiKeyApplicationService {

    private final ApiKeyRepository apiKeyRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

    private static final String PREFIX = "ldop_sk_";
    private static final int SECRET_LENGTH = 16;

    @Transactional
    public String generateApiKey(String tenantIdStr, String name, LocalDateTime expiresAt) {
        TenantId tenantId = new TenantId(tenantIdStr);
        ApiKeyId id = ApiKeyId.generate();
        byte[] secretBytes = new byte[SECRET_LENGTH];
        secureRandom.nextBytes(secretBytes);
        
        // We use the UUID from ApiKeyId for the raw key generation
        // Note: ApiKeyId wraps a UUID, we need to access it. 
        // Since ApiKeyId.toString() returns the UUID string, we can parse it back or add a getter.
        // Ideally ApiKeyId should expose the UUID or we just use the string representation.
        // The legacy code used: Base64...encodeToString(asBytes(id))
        // Let's stick to the legacy format for compatibility if needed, or just use the new ID.
        // Legacy format: ldop_sk_<base64_id>.<base64_secret>
        
        UUID uuid = UUID.fromString(id.toString());
        String idPart = Base64.getUrlEncoder().withoutPadding().encodeToString(asBytes(uuid));
        String secretPart = Base64.getUrlEncoder().withoutPadding().encodeToString(secretBytes);
        
        String rawKey = PREFIX + idPart + "." + secretPart;
        String keyHash = passwordEncoder.encode(rawKey);

        ApiKey apiKey = ApiKey.create(
                id,
                tenantId,
                name,
                keyHash,
                PREFIX,
                expiresAt
        );

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
            UUID uuid = asUuid(Base64.getUrlDecoder().decode(idPart));
            ApiKeyId id = new ApiKeyId(uuid);

            return apiKeyRepository.findById(id)
                    .filter(apiKey -> AppConstants.STATUS_ACTIVE.equals(apiKey.getStatus()))
                    .filter(apiKey -> apiKey.getExpiresAt() == null || apiKey.getExpiresAt().isAfter(LocalDateTime.now()))
                    .filter(apiKey -> passwordEncoder.matches(rawKey, apiKey.getKeyHash()))
                    .map(apiKey -> {
                        // Update last used
                        // We need a transactional method to update this if we want it persisted
                        // For now, we can just return it, but ideally we should update it.
                        // Since this method is not transactional, we might need a separate call or make this transactional.
                        // However, validate is often called in filters where transaction might be tricky.
                        // Let's keep it simple: if we want to update, we should do it.
                        // But wait, the legacy code did: apiKey.setLastUsedAt(LocalDateTime.now()); apiKeyRepository.save(apiKey);
                        // We should probably do the same but via a business method.
                        return updateLastUsed(apiKey);
                    });

        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }
    
    @Transactional
    protected ApiKey updateLastUsed(ApiKey apiKey) {
        apiKey.updateLastUsedAt();
        return apiKeyRepository.save(apiKey);
    }

    @Transactional
    public void revokeApiKey(String idStr) {
        ApiKeyId id = new ApiKeyId(UUID.fromString(idStr));
        apiKeyRepository.findById(id).ifPresent(apiKey -> {
            apiKey.revoke();
            apiKeyRepository.save(apiKey);
        });
    }

    public List<ApiKey> getApiKeysByTenant(String tenantIdStr) {
        return apiKeyRepository.findByTenantId(new TenantId(tenantIdStr));
    }

    public List<ApiKey> getApiKeysByTenantAndStatus(String tenantIdStr, String status) {
        return apiKeyRepository.findByTenantId(new TenantId(tenantIdStr)).stream()
                .filter(apiKey -> status.equals(apiKey.getStatus()))
                .collect(Collectors.toList());
    }

    public Optional<ApiKey> getApiKeyById(String idStr) {
        return apiKeyRepository.findById(new ApiKeyId(UUID.fromString(idStr)));
    }

    @Transactional
    public void deleteApiKey(String idStr) {
        apiKeyRepository.deleteById(new ApiKeyId(UUID.fromString(idStr)));
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
