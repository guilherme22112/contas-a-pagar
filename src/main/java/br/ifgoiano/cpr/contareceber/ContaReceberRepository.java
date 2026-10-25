package br.ifgoiano.cpr.contareceber;

import br.ifgoiano.cpr.shared.enums.SituacaoConta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ContaReceberRepository extends JpaRepository<ContaReceber, Long> {
    List<ContaReceber> findByVencimentoBetweenAndSituacao(LocalDate inicio, LocalDate fim, SituacaoConta situacao);
    List<ContaReceber> findByVencimentoBetween(LocalDate inicio, LocalDate fim);
    List<ContaReceber> findBySituacao(SituacaoConta situacao);
}