package com.epicode.documentarchive.service;

import com.epicode.documentarchive.dto.UpdateDocumentoRequest;
import com.epicode.documentarchive.entity.Documento;
import com.epicode.documentarchive.repository.DocumentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class DocumentoService {

    private final DocumentoRepository documentoRepository;

    /** Ritorna tutti i documenti. */
    public List<Documento> findAll() {
        return documentoRepository.findAll();
    }

    /** Ritorna un documento per id. */
    public Documento findById(UUID id) {
        return documentoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Documento non trovato: " + id));
    }

    /** Inserisce entita' Documento nel db. */
    public Documento save(Documento documento) {
        return documentoRepository.save(documento);
    }

    /** Aggiorna testo corretto + stato di un documento esistente. */
    public Documento update(UUID id, UpdateDocumentoRequest request) {
        Documento documento = findById(id);
        documento.setText(request.text());
        documento.setStato(request.stato());
        return documentoRepository.save(documento);
    }
}
