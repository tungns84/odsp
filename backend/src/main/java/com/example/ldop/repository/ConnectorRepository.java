package com.example.ldop.repository;

import com.example.ldop.domain.Connector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConnectorRepository extends JpaRepository<Connector, UUID> {
    List<Connector> findAllByTenantId(String tenantId);
    Optional<Connector> findByIdAndTenantId(UUID id, String tenantId);
}
