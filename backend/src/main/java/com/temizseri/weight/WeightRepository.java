package com.temizseri.weight;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WeightRepository extends JpaRepository<WeightEntry, Long> {

    List<WeightEntry> findAllByOrderByDateAsc();

    List<WeightEntry> findByDateBetweenOrderByDateAsc(LocalDate from, LocalDate to);

    Optional<WeightEntry> findByDate(LocalDate date);
}
