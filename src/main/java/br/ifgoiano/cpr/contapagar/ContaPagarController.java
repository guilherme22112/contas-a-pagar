package br.ifgoiano.cpr.contapagar;

import br.ifgoiano.cpr.shared.dto.QuitacaoRequest;
import br.ifgoiano.cpr.shared.enums.SituacaoConta;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/contas-pagar")
public class ContaPagarController {

    private final ContaPagarService service;

    public ContaPagarController(ContaPagarService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ContaPagar>> listar(
            @RequestParam(required = false) LocalDate inicio,
            @RequestParam(required = false) LocalDate fim,
            @RequestParam(required = false) SituacaoConta situacao) {
        return ResponseEntity.ok(service.listar(inicio, fim, situacao));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContaPagar> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ContaPagar> lancar(@Valid @RequestBody ContaPagar conta) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.lancar(conta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContaPagar> atualizar(@PathVariable Long id, @Valid @RequestBody ContaPagar conta) {
        return ResponseEntity.ok(service.atualizar(id, conta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pagamento")
    public ResponseEntity<ContaPagar> quitar(@PathVariable Long id, @Valid @RequestBody QuitacaoRequest request) {
        ContaPagar contaPaga = service.quitar(id, request.getData(), request.getDesconto(), request.getAcrescimo());
        return ResponseEntity.ok(contaPaga);
    }
}