package com.epicode.documentarchive.dto;

import com.epicode.documentarchive.entity.StatoElaborazione;
import jakarta.validation.constraints.NotNull;

/** Aggiornamento testo corretto + stato elaborazione. */
public record UpdateDocumentoRequest(
        String text,
        @NotNull StatoElaborazione stato
) {
}
