package com.temizseri.tracker;

import com.temizseri.habit.Habit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;

/** Bir alışkanlığın belirli bir günde yapıldığını kaydeder. Satır yoksa o gün yapılmamıştır. */
@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"check_date", "habit_id"}))
public class HabitCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "check_date", nullable = false)
    private LocalDate day;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "habit_id")
    private Habit habit;

    protected HabitCheck() {
    }

    public HabitCheck(LocalDate day, Habit habit) {
        this.day = day;
        this.habit = habit;
    }

    public LocalDate getDay() {
        return day;
    }

    public Habit getHabit() {
        return habit;
    }
}
