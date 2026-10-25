package br.ifgoiano.cpr.planoconta;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
public class PlanoConta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 18)
    private String codigo;

    @NotBlank
    @Column(nullable = false, length = 60)
    private String descricao;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "superior_id")
    private PlanoConta superior;

    @NotNull
    @Column(nullable = false)
    private Boolean consolidada = false;
}