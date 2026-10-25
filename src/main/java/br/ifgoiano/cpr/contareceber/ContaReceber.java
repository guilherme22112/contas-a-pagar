package br.ifgoiano.cpr.contareceber;

import br.ifgoiano.cpr.pessoa.Pessoa;
import br.ifgoiano.cpr.planoconta.PlanoConta;
import br.ifgoiano.cpr.shared.enums.SituacaoConta;
import br.ifgoiano.cpr.shared.enums.TipoTitulo;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
public class ContaReceber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 20)
    private String numeroTitulo;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "pessoa_id", nullable = false)
    private Pessoa pessoa;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "plano_conta_id", nullable = false)
    private PlanoConta planoConta;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoTitulo tipoTitulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private SituacaoConta situacao = SituacaoConta.ABERTA;

    @NotNull
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal valor;

    @NotNull
    @Column(nullable = false)
    private LocalDate emissao;

    @NotNull
    @Column(nullable = false)
    private LocalDate vencimento;

    @Column(precision = 14, scale = 2)
    private BigDecimal desconto = BigDecimal.ZERO;

    private LocalDate validadeDesc;

    @Column(precision = 14, scale = 2)
    private BigDecimal acrescimo = BigDecimal.ZERO;

    private LocalDate dataRecebimento;

    @Column(precision = 14, scale = 2)
    private BigDecimal valorRecebido;

    @Column(length = 255)
    private String observacao;
}