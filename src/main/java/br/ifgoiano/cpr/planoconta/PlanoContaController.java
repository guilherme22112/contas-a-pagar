package br.ifgoiano.cpr.planoconta;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/plano-contas")
public class PlanoContaController {

    private final PlanoContaService service;

    public PlanoContaController(PlanoContaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PlanoConta>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanoConta> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PlanoConta> salvar(@Valid @RequestBody PlanoConta planoConta) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.salvar(planoConta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanoConta> atualizar(@PathVariable Long id, @Valid @RequestBody PlanoConta planoConta) {
        return ResponseEntity.ok(service.atualizar(id, planoConta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}