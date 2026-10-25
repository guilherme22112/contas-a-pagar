package br.ifgoiano.cpr.contapagar;

import br.ifgoiano.cpr.shared.enums.SituacaoConta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ContaPagarRepository extends JpaRepository<ContaPagar, Long> {
    List<ContaPagar> findByVencimentoBetweenAndSituacao(LocalDate inicio, LocalDate fim, SituacaoConta situacao);
    List<ContaPagar> findByVencimentoBetween(LocalDate inicio, LocalDate fim);
    List<ContaPagar> findBySituacao(SituacaoConta situacao);
}