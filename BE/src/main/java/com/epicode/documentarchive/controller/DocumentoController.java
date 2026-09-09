package com.epicode.documentarchive.controller;

import com.epicode.documentarchive.dto.UpdateDocumentoRequest;
import com.epicode.documentarchive.entity.Documento;
import com.epicode.documentarchive.entity.StatoElaborazione;
import com.epicode.documentarchive.service.DocumentoService;
import com.epicode.documentarchive.service.OcrService;
import com.epicode.documentarchive.service.StorageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping("/api/document")
@RequiredArgsConstructor
@Validated
public class DocumentoController {

    private final DocumentoService documentoService;
    private final OcrService ocrService;
    private final StorageService storageService;

    /** Lista documenti archiviati. */
    @GetMapping("/all")
    public List<Documento> getAll() {
        return documentoService.findAll();
    }

    /** Riapertura: metadati + testo di un documento. */
    @GetMapping("/{id}")
    public Documento getById(@PathVariable UUID id) {
        return documentoService.findById(id);
    }

    /** Riapertura visuale: serve file originale. */
    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getFile(@PathVariable UUID id) {
        Documento documento = documentoService.findById(id);
        Resource resource = storageService.loadAsResource(documento.getPath());
        String contentType = documento.getContentType() == null
                ? MediaType.APPLICATION_OCTET_STREAM_VALUE
                : documento.getContentType();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + documento.getTitolo() + "\"")
                .body(resource);
    }

    /** OCR only. Ritorna testo estratto, nessun salvataggio. */
    @PostMapping(value = "/scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> scan(@RequestParam("file") MultipartFile file,
                                    @RequestParam(value = "language", defaultValue = "ita+eng") String language) {
        return Map.of("text", ocrService.extractText(readBytes(file), file.getOriginalFilename(), language));
    }

    /** Salva in archivio: file originale + testo corretto + titolo + stato. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Documento create(@RequestParam("titolo") @NotBlank String titolo,
                            @RequestParam("file") MultipartFile file,
                            @RequestParam(value = "text", required = false) String text,
                            @RequestParam(value = "stato", defaultValue = "SALVATO") StatoElaborazione stato) {
        String path = storageService.store(file);

        Documento documento = new Documento();
        documento.setTitolo(titolo);
        documento.setPath(path);
        documento.setPeso(file.getSize());
        documento.setContentType(file.getContentType());
        documento.setText(text);
        documento.setStato(stato);

        return documentoService.save(documento);
    }

    /** Riapre, corregge ancora, salva: aggiorna testo + stato. */
    @PutMapping("/{id}")
    public Documento update(@PathVariable UUID id,
                            @Valid @RequestBody UpdateDocumentoRequest request) {
        return documentoService.update(id, request);
    }

    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(BAD_REQUEST, "Lettura file fallita: " + e.getMessage());
        }
    }
}
