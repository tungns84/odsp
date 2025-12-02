package com.gs.dsp.service;

import com.gs.dsp.domain.ApiKey;
import com.gs.dsp.repository.ApiKeyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApiKeyServiceTest {

    @Mock
    private ApiKeyRepository apiKeyRepository;

    @InjectMocks
    private ApiKeyService apiKeyService;

    private ApiKey apiKey;
    private UUID apiKeyId;

    @BeforeEach
    void setUp() {
        apiKeyId = UUID.randomUUID();
        apiKey = ApiKey.builder()
                .id(apiKeyId)
                .tenantId("test-tenant")
                .name("Test Key")
                .keyHash("hashed-key")
                .prefix("ldop_sk_")
                .status("ACTIVE")
                .build();
    }

    @Test
    void generateApiKey_ShouldReturnRawKeyAndSave() {
        when(apiKeyRepository.save(any(ApiKey.class))).thenReturn(apiKey);

        String rawKey = apiKeyService.generateApiKey("test-tenant", "Test Key", null);

        assertNotNull(rawKey);
        assertTrue(rawKey.startsWith("ldop_sk_"));
        verify(apiKeyRepository).save(any(ApiKey.class));
    }

    @Test
    void getApiKeysByTenant_ShouldReturnList() {
        when(apiKeyRepository.findByTenantId("test-tenant")).thenReturn(Arrays.asList(apiKey));

        List<ApiKey> result = apiKeyService.getApiKeysByTenant("test-tenant");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("test-tenant", result.get(0).getTenantId());
        verify(apiKeyRepository).findByTenantId("test-tenant");
    }

    @Test
    void revokeApiKey_WhenExists_ShouldSetStatusRevoked() {
        when(apiKeyRepository.findById(apiKeyId)).thenReturn(Optional.of(apiKey));
        when(apiKeyRepository.save(any(ApiKey.class))).thenReturn(apiKey);

        apiKeyService.revokeApiKey(apiKeyId);

        assertEquals("REVOKED", apiKey.getStatus());
        verify(apiKeyRepository).save(apiKey);
    }

    @Test
    void deleteApiKey_ShouldCallDelete() {
        apiKeyService.deleteApiKey(apiKeyId);
        verify(apiKeyRepository).deleteById(apiKeyId);
    }
}
