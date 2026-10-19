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

    /** Takvimden açılan tek bir günün alışkanlıkları. */
    public record DayDetail(LocalDate date, List<HabitStatus> habits) {
    }

    /**
     * monthRate: bu ay bugüne kadar yapılan işaret / yapılabilecek işaret (0-1).
     * firstDay: ilk kaydın tarihi, hiç kayıt yoksa null.
     */
    public record Stats(int currentStreak, int bestStreak, int cleanDays, double monthRate, LocalDate firstDay) {
    }
}
