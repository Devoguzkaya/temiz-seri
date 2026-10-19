package com.temizseri.tracker;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface HabitCheckRepository extends JpaRepository<HabitCheck, Long> {

    List<HabitCheck> findByDayBetween(LocalDate from, LocalDate to);

    boolean existsByDayAndHabitId(LocalDate day, Long habitId);

    void deleteByDayAndHabitId(LocalDate day, Long habitId);

    /** Verilen tarihten önceki, tüm alışkanlıkların yapıldığı günler (yeniden eskiye). */
    @Query("""
            select c.day from HabitCheck c
            where c.day < :before
            group by c.day
            having count(c) >= :habitCount
            order by c.day desc
            """)
    List<LocalDate> findCompleteDaysBefore(@Param("before") LocalDate before,
                                           @Param("habitCount") long habitCount);

    /** Tüm alışkanlıkların yapıldığı günler (eskiden yeniye). */
    @Query("""
            select c.day from HabitCheck c
            where c.day <= :until
            group by c.day
            having count(c) >= :habitCount
            order by c.day asc
            """)
    List<LocalDate> findCompleteDaysUntil(@Param("until") LocalDate until,
                                          @Param("habitCount") long habitCount);

    @Query("select min(c.day) from HabitCheck c")
    LocalDate findFirstDay();
}
