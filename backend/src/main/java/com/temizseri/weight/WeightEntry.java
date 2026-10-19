package com.temizseri.weight;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Günde bir tartı kaydı. */
@Entity
public class WeightEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entry_date", nullable = false, unique = true)
    private LocalDate date;

    @Column(nullable = false, precision = 5, scale = 1)
    private BigDecimal kg;

    protected WeightEntry() {
    }

    public WeightEntry(LocalDate date, BigDecimal kg) {
        this.date = date;
        this.kg = kg;
    }

    public LocalDate getDate() {
        return date;
    }

    public BigDecimal getKg() {
        return kg;
    }

    public void setKg(BigDecimal kg) {
        this.kg = kg;
    }
}
