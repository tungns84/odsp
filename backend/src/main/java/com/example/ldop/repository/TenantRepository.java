package com.example.ldop.repository;

import com.example.ldop.domain.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, String> {
    List<Tenant> findByStatus(String status);
}
