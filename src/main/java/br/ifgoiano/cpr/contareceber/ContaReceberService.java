package br.ifgoiano.cpr.contareceber;

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
public class ContaReceberService {

    private final ContaReceberRepository repository;
    private final PessoaService pessoaService;
    private final PlanoContaService planoContaService;

    public ContaReceberService(ContaReceberRepository repository, PessoaService pessoaService, PlanoContaService planoContaService) {
        this.repository = repository;
        this.pessoaService = pessoaService;
        this.planoContaService = planoContaService;
    }

    @Transactional(readOnly = true)
    public List<ContaReceber> listar(LocalDate inicio, LocalDate fim, SituacaoConta situacao) {
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
    public ContaReceber buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Conta a receber não encontrada."));
    }

    @Transactional
    public ContaReceber lancar(ContaReceber conta) {
        pessoaService.buscarPorId(conta.getPessoa().getId());
        planoContaService.buscarPorId(conta.getPlanoConta().getId());
        conta.setSituacao(SituacaoConta.ABERTA);
        return repository.save(conta);
    }

    @Transactional
    public ContaReceber atualizar(Long id, ContaReceber contaAtualizada) {
        ContaReceber existente = buscarPorId(id);

        if (existente.getSituacao() == SituacaoConta.RECEBIDA) {
            throw new NegocioException("Não é possível alterar uma conta já recebida.");
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
        ContaReceber existente = buscarPorId(id);
        if (existente.getSituacao() == SituacaoConta.RECEBIDA) {
            throw new NegocioException("Não é possível excluir uma conta já recebida.");
        }
        repository.delete(existente);
    }

    @Transactional
    public ContaReceber receber(Long id, LocalDate dataRecebimento, BigDecimal desconto, BigDecimal acrescimo) {
        ContaReceber conta = buscarPorId(id);

        if (conta.getSituacao() == SituacaoConta.RECEBIDA) {
            throw new NegocioException("Este título já se encontra recebido.");
        }

        if (desconto != null && desconto.compareTo(BigDecimal.ZERO) > 0) {
            if (conta.getValidadeDesc() != null && dataRecebimento.isAfter(conta.getValidadeDesc())) {
                throw new NegocioException("O prazo de validade para o desconto já expirou.");
            }
        }

        BigDecimal valorDesconto = desconto != null ? desconto : BigDecimal.ZERO;
        BigDecimal valorAcrescimo = acrescimo != null ? acrescimo : BigDecimal.ZERO;

        BigDecimal valorEfetivo = conta.getValor().subtract(valorDesconto).add(valorAcrescimo);

        conta.setDataRecebimento(dataRecebimento);
        conta.setDesconto(valorDesconto);
        conta.setAcrescimo(valorAcrescimo);
        conta.setValorRecebido(valorEfetivo);
        conta.setSituacao(SituacaoConta.RECEBIDA);

        return repository.save(conta);
    }
}