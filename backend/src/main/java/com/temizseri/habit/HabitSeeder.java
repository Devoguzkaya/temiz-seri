package com.temizseri.habit;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** İlk açılışta takip edilecek 4 alışkanlığı ekler. */
@Component
public class HabitSeeder implements ApplicationRunner {

    private final HabitRepository habits;

    public HabitSeeder(HabitRepository habits) {
        this.habits = habits;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (habits.count() > 0) {
            return;
        }
        habits.save(new Habit("Şekerli içecek yok", "Kola, meyve suyu, şekerli çay/kahve", 1));
        habits.save(new Habit("Kızartma yok", "Patates, börek, tavada yağlı", 2));
        habits.save(new Habit("Esmer tercih", "Beyaz ekmek ve pilav yerine", 3));
        habits.save(new Habit("Gece atıştırması yok", "Akşam yemeğinden sonra bir şey yok", 4));
    }
}
