package com.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillEntry {

    @Column(nullable = false, length = 100)
    private String skillName;

    @Column(length = 50)
    private String proficiency;

    private BigDecimal yearsOfExperience;

    private LocalDate lastUsedDate;
}
