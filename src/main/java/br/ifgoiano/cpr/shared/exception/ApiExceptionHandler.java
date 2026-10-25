package br.ifgoiano.cpr.shared.exception;

import br.ifgoiano.cpr.shared.dto.ErroResposta;
import jakarta.persistence.EntityNotFoundException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ApiExceptionHandler {

    // Erro 422 - Quebra de regra de negócio
    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<ErroResposta> handleNegocioException(NegocioException ex) {
        ErroResposta erro = new ErroResposta(
                LocalDateTime.now(),
                422,
                "REGRA_NEGOCIO",
                ex.getMessage(),
                null
        );
        return ResponseEntity.status(422).body(erro);
    }

    // Erro 404 - Recurso não encontrado
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErroResposta> handleEntityNotFound(EntityNotFoundException ex) {
        ErroResposta erro = new ErroResposta(
                LocalDateTime.now(),
                404,
                "NAO_ENCONTRADO",
                "O recurso solicitado não foi encontrado na base de dados.",
                null
        );
        return ResponseEntity.status(404).body(erro);
    }

    // Erro 400 - Falha de validação
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResposta> handleValidacao(MethodArgumentNotValidException ex) {
        List<ErroResposta.CampoErro> campos = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> new ErroResposta.CampoErro(f.getField(), f.getDefaultMessage()))
                .collect(Collectors.toList());

        ErroResposta erro = new ErroResposta(
                LocalDateTime.now(),
                400,
                "FALHA_VALIDACAO",
                "Um ou mais campos estão inválidos. Faça o preenchimento correto e tente novamente.",
                campos
        );
        return ResponseEntity.status(400).body(erro);
    }

    // Erro 409
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResposta> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        ErroResposta erro = new ErroResposta(
                LocalDateTime.now(),
                409,
                "CONFLITO_DE_DADOS",
                "Erro de integridade. Você pode estar tentando cadastrar um dado que já existe no sistema e deve ser único (ex: código, documento ou número de título).",
                null
        );
        return ResponseEntity.status(409).body(erro);
    }
}