package com.temizseri.tracker;

import java.time.LocalDate;
import java.util.List;

/** Ana ekranın ihtiyaç duyduğu her şey tek yanıtta. */
public record Summary(
        LocalDate today,
        List<HabitStatus> habits,
        int streak,
        int streakBeforeToday,
        List<DayScore> lastSevenDays) {

    public record HabitStatus(Long id, String name, String hint, boolean done) {
    }

    public record DayScore(LocalDate date, int done, int total) {
    }
}
