package com.gs.dsp.iam.application.service;

import com.gs.dsp.iam.domain.model.ApiKey;
import com.gs.dsp.iam.domain.model.ApiKeyId;
import com.gs.dsp.iam.domain.model.TenantId;
import com.gs.dsp.iam.domain.repository.ApiKeyRepository;
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
class ApiKeyApplicationServiceTest {

    @Mock
    private ApiKeyRepository apiKeyRepository;

    @InjectMocks
    private ApiKeyApplicationService apiKeyService;

    private ApiKey apiKey;
    private ApiKeyId apiKeyId;

    @BeforeEach
    void setUp() {
        apiKeyId = ApiKeyId.generate();
        apiKey = ApiKey.create(
                apiKeyId,
                new TenantId("test-tenant"),
                "Test Key",
                "hashed-key",
                "ldop_sk_",
                null
        );
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
        when(apiKeyRepository.findByTenantId(new TenantId("test-tenant"))).thenReturn(Arrays.asList(apiKey));

        List<ApiKey> result = apiKeyService.getApiKeysByTenant("test-tenant");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("test-tenant", result.get(0).getTenantId().toString());
        verify(apiKeyRepository).findByTenantId(new TenantId("test-tenant"));
    }

    @Test
    void revokeApiKey_WhenExists_ShouldSetStatusRevoked() {
        // Mock finding by ID
        // Note: The service takes String ID, converts to ApiKeyId
        // We need to match the ApiKeyId constructed inside the service
        // Since ApiKeyId uses UUID, and we can't easily predict the UUID if generated inside,
        // but here we pass the ID string.
        
        String idStr = apiKeyId.toString();
        when(apiKeyRepository.findById(any(ApiKeyId.class))).thenReturn(Optional.of(apiKey));
        when(apiKeyRepository.save(any(ApiKey.class))).thenReturn(apiKey);

        apiKeyService.revokeApiKey(idStr);

        assertEquals("REVOKED", apiKey.getStatus());
        verify(apiKeyRepository).save(apiKey);
    }

    @Test
    void deleteApiKey_ShouldCallDelete() {
        String idStr = apiKeyId.toString();
        apiKeyService.deleteApiKey(idStr);
        verify(apiKeyRepository).deleteById(any(ApiKeyId.class));
    }
}
