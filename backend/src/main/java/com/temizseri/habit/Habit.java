package com.temizseri.habit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String hint;

    @Column(nullable = false)
    private int sortOrder;

    protected Habit() {
    }

    public Habit(String name, String hint, int sortOrder) {
        this.name = name;
        this.hint = hint;
        this.sortOrder = sortOrder;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getHint() {
        return hint;
    }

    public int getSortOrder() {
        return sortOrder;
    }
}
