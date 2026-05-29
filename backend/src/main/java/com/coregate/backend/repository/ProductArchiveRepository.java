package com.coregate.backend.repository;

import com.coregate.backend.domain.ProductArchiveEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductArchiveRepository extends JpaRepository<ProductArchiveEntity, String> {
}
