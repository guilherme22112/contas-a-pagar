package br.ifgoiano.cpr.contareceber;

import br.ifgoiano.cpr.shared.dto.QuitacaoRequest;
import br.ifgoiano.cpr.shared.enums.SituacaoConta;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/contas-receber")
public class ContaReceberController {

    private final ContaReceberService service;

    public ContaReceberController(ContaReceberService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ContaReceber>> listar(
            @RequestParam(required = false) LocalDate inicio,
            @RequestParam(required = false) LocalDate fim,
            @RequestParam(required = false) SituacaoConta situacao) {
        return ResponseEntity.ok(service.listar(inicio, fim, situacao));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContaReceber> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ContaReceber> lancar(@Valid @RequestBody ContaReceber conta) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.lancar(conta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContaReceber> atualizar(@PathVariable Long id, @Valid @RequestBody ContaReceber conta) {
        return ResponseEntity.ok(service.atualizar(id, conta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/recebimento")
    public ResponseEntity<ContaReceber> receber(@PathVariable Long id, @Valid @RequestBody QuitacaoRequest request) {
        ContaReceber contaRecebida = service.receber(id, request.getData(), request.getDesconto(), request.getAcrescimo());
        return ResponseEntity.ok(contaRecebida);
    }
}