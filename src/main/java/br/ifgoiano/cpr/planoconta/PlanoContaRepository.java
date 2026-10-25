package br.ifgoiano.cpr.planoconta;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanoContaRepository extends JpaRepository<PlanoConta, Long> {
}