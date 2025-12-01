package com.example.ldop.service;

import com.example.ldop.domain.Tenant;
import com.example.ldop.repository.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantServiceTest {

    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private TenantService tenantService;

    private Tenant tenant;

    @BeforeEach
    void setUp() {
        tenant = Tenant.builder()
                .id("test-tenant")
                .name("Test Tenant")
                .status("ACTIVE")
                .build();
    }

    @Test
    void getAllTenants_ShouldReturnList() {
        when(tenantRepository.findAll()).thenReturn(Arrays.asList(tenant));

        List<Tenant> result = tenantService.getAllTenants();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("test-tenant", result.get(0).getId());
        verify(tenantRepository).findAll();
    }

    @Test
    void getTenantById_WhenExists_ShouldReturnTenant() {
        when(tenantRepository.findById("test-tenant")).thenReturn(Optional.of(tenant));

        Optional<Tenant> result = tenantService.getTenantById("test-tenant");

        assertTrue(result.isPresent());
        assertEquals("test-tenant", result.get().getId());
        verify(tenantRepository).findById("test-tenant");
    }

    @Test
    void createTenant_ShouldSaveAndReturnTenant() {
        when(tenantRepository.save(any(Tenant.class))).thenReturn(tenant);

        Tenant result = tenantService.createTenant(tenant);

        assertNotNull(result);
        assertEquals("test-tenant", result.getId());
        verify(tenantRepository).save(tenant);
    }

    @Test
    void updateTenant_WhenExists_ShouldUpdateAndReturn() {
        Tenant updateDetails = Tenant.builder()
                .name("Updated Name")
                .description("Updated Desc")
                .status("INACTIVE")
                .build();

        when(tenantRepository.findById("test-tenant")).thenReturn(Optional.of(tenant));
        when(tenantRepository.save(any(Tenant.class))).thenReturn(tenant);

        Tenant result = tenantService.updateTenant("test-tenant", updateDetails);

        assertEquals("Updated Name", result.getName());
        assertEquals("Updated Desc", result.getDescription());
        assertEquals("INACTIVE", result.getStatus());
        verify(tenantRepository).save(tenant);
    }

    @Test
    void deleteTenant_WhenExists_ShouldDelete() {
        when(tenantRepository.existsById("test-tenant")).thenReturn(true);

        tenantService.deleteTenant("test-tenant");

        verify(tenantRepository).deleteById("test-tenant");
    }

    @Test
    void deleteTenant_WhenNotExists_ShouldThrowException() {
        when(tenantRepository.existsById("non-existent")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> {
            tenantService.deleteTenant("non-existent");
        });

        verify(tenantRepository, never()).deleteById(any());
    }
}
