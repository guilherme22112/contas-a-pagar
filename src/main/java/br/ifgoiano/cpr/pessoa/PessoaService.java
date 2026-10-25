package br.ifgoiano.cpr.pessoa;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class PessoaService {

    private final PessoaRepository repository;

    public PessoaService(PessoaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Pessoa> listarTodas() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Pessoa buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pessoa não encontrada."));
    }

    @Transactional
    public Pessoa salvar(Pessoa pessoa) {
        return repository.save(pessoa);
    }

    @Transactional
    public Pessoa atualizar(Long id, Pessoa pessoaAtualizada) {
        Pessoa existente = buscarPorId(id);
        existente.setTipo(pessoaAtualizada.getTipo());
        existente.setNome(pessoaAtualizada.getNome());
        existente.setDocumento(pessoaAtualizada.getDocumento());
        existente.setInscricaoEstadual(pessoaAtualizada.getInscricaoEstadual());
        existente.setEndereco(pessoaAtualizada.getEndereco());
        existente.setCidade(pessoaAtualizada.getCidade());
        existente.setUf(pessoaAtualizada.getUf());
        existente.setCep(pessoaAtualizada.getCep());
        existente.setTelefone(pessoaAtualizada.getTelefone());
        existente.setEmail(pessoaAtualizada.getEmail());
        existente.setContato(pessoaAtualizada.getContato());
        return repository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        Pessoa existente = buscarPorId(id);
        repository.delete(existente);
    }
}