package br.ifgoiano.cpr.shared.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ErroResposta {
    private LocalDateTime timestamp;
    private Integer status;
    private String erro;
    private String mensagem;
    private List<CampoErro> campos;

    public ErroResposta(LocalDateTime timestamp, Integer status, String erro, String mensagem, List<CampoErro> campos) {
        this.timestamp = timestamp;
        this.status = status;
        this.erro = erro;
        this.mensagem = mensagem;
        this.campos = campos;
    }

    @Data
    public static class CampoErro {
        private String nome;
        private String mensagem;

        public CampoErro(String nome, String mensagem) {
            this.nome = nome;
            this.mensagem = mensagem;
        }
    }
}