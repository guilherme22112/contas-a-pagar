package br.ifgoiano.cpr.contapagar;

import br.ifgoiano.cpr.pessoa.PessoaService;
import br.ifgoiano.cpr.planoconta.PlanoContaService;
import br.ifgoiano.cpr.shared.enums.SituacaoConta;
import br.ifgoiano.cpr.shared.exception.NegocioException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class ContaPagarService {

    private final ContaPagarRepository repository;
    private final PessoaService pessoaService;
    private final PlanoContaService planoContaService;

    public ContaPagarService(ContaPagarRepository repository, PessoaService pessoaService, PlanoContaService planoContaService) {
        this.repository = repository;
        this.pessoaService = pessoaService;
        this.planoContaService = planoContaService;
    }

    @Transactional(readOnly = true)
    public List<ContaPagar> listar(LocalDate inicio, LocalDate fim, SituacaoConta situacao) {
        if (inicio != null && fim != null && situacao != null) {
            return repository.findByVencimentoBetweenAndSituacao(inicio, fim, situacao);
        } else if (inicio != null && fim != null) {
            return repository.findByVencimentoBetween(inicio, fim);
        } else if (situacao != null) {
            return repository.findBySituacao(situacao);
        }
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public ContaPagar buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Conta a pagar não encontrada."));
    }

    @Transactional
    public ContaPagar lancar(ContaPagar conta) {
        pessoaService.buscarPorId(conta.getPessoa().getId());
        planoContaService.buscarPorId(conta.getPlanoConta().getId());
        conta.setSituacao(SituacaoConta.ABERTA);
        return repository.save(conta);
    }

    @Transactional
    public ContaPagar atualizar(Long id, ContaPagar contaAtualizada) {
        ContaPagar existente = buscarPorId(id);
        
        if (existente.getSituacao() == SituacaoConta.PAGA) {
            throw new NegocioException("Não é possível alterar uma conta já paga.");
        }

        pessoaService.buscarPorId(contaAtualizada.getPessoa().getId());
        planoContaService.buscarPorId(contaAtualizada.getPlanoConta().getId());

        existente.setNumeroTitulo(contaAtualizada.getNumeroTitulo());
        existente.setPessoa(contaAtualizada.getPessoa());
        existente.setPlanoConta(contaAtualizada.getPlanoConta());
        existente.setTipoTitulo(contaAtualizada.getTipoTitulo());
        existente.setValor(contaAtualizada.getValor());
        existente.setEmissao(contaAtualizada.getEmissao());
        existente.setVencimento(contaAtualizada.getVencimento());
        existente.setDesconto(contaAtualizada.getDesconto());
        existente.setValidadeDesc(contaAtualizada.getValidadeDesc());
        existente.setAcrescimo(contaAtualizada.getAcrescimo());
        existente.setObservacao(contaAtualizada.getObservacao());

        return repository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        ContaPagar existente = buscarPorId(id);
        if (existente.getSituacao() == SituacaoConta.PAGA) {
            throw new NegocioException("Não é possível excluir uma conta já paga.");
        }
        repository.delete(existente);
    }

    @Transactional
    public ContaPagar quitar(Long id, LocalDate dataPagamento, BigDecimal desconto, BigDecimal acrescimo) {
        ContaPagar conta = buscarPorId(id);

        if (conta.getSituacao() == SituacaoConta.PAGA) {
            throw new NegocioException("Este título já se encontra pago.");
        }

        if (desconto != null && desconto.compareTo(BigDecimal.ZERO) > 0) {
            if (conta.getValidadeDesc() != null && dataPagamento.isAfter(conta.getValidadeDesc())) {
                throw new NegocioException("O prazo de validade para o desconto já expirou.");
            }
        }

        BigDecimal valorDesconto = desconto != null ? desconto : BigDecimal.ZERO;
        BigDecimal valorAcrescimo = acrescimo != null ? acrescimo : BigDecimal.ZERO;

        BigDecimal valorEfetivo = conta.getValor().subtract(valorDesconto).add(valorAcrescimo);

        conta.setDataPagamento(dataPagamento);
        conta.setDesconto(valorDesconto);
        conta.setAcrescimo(valorAcrescimo);
        conta.setValorPago(valorEfetivo);
        conta.setSituacao(SituacaoConta.PAGA); 

        return repository.save(conta);
    }
}