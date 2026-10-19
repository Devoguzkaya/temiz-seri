package com.temizseri.profile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileRepository profiles;

    public ProfileController(ProfileRepository profiles) {
        this.profiles = profiles;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ProfileDto get() {
        return ProfileDto.of(profiles.findById(Profile.SINGLETON_ID).orElseGet(Profile::new));
    }

    /** Boş bırakılan alan temizlenir. */
    @PutMapping
    @Transactional
    public ProfileDto save(@Valid @RequestBody ProfileDto body) {
        Profile profile = profiles.findById(Profile.SINGLETON_ID).orElseGet(Profile::new);
        profile.setGoalKg(body.goalKg() == null ? null : body.goalKg().setScale(1, RoundingMode.HALF_UP));
        profile.setHeightCm(body.heightCm());
        return ProfileDto.of(profiles.save(profile));
    }

    public record ProfileDto(
            @DecimalMin(value = "20", message = "Hedef kilo 20 ile 400 arasında olmalı.")
            @DecimalMax(value = "400", message = "Hedef kilo 20 ile 400 arasında olmalı.") BigDecimal goalKg,
            @Min(value = 100, message = "Boy 100 ile 250 cm arasında olmalı.")
            @Max(value = 250, message = "Boy 100 ile 250 cm arasında olmalı.") Integer heightCm) {

        static ProfileDto of(Profile p) {
            return new ProfileDto(p.getGoalKg(), p.getHeightCm());
        }
    }
}
