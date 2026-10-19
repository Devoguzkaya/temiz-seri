package com.temizseri.profile;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import java.math.BigDecimal;

/** Tek kullanıcılı kurulumda hedef kilo ve boy. Her zaman id=1 olan tek satır. */
@Entity
public class Profile {

    static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    @Column(precision = 5, scale = 1)
    private BigDecimal goalKg;

    private Integer heightCm;

    public BigDecimal getGoalKg() {
        return goalKg;
    }

    public void setGoalKg(BigDecimal goalKg) {
        this.goalKg = goalKg;
    }

    public Integer getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Integer heightCm) {
        this.heightCm = heightCm;
    }
}
