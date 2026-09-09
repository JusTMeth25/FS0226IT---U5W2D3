package com.epicode.documentarchive.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@Slf4j
public class StorageService {

    private final Path root;

    public StorageService(@Value("${storage.upload-dir}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Creazione cartella upload fallita", e);
        }
    }

    /** Salva file su filesystem. Ritorna path assoluto salvato. */
    public String store(MultipartFile file) {
        String original = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        String stored = UUID.randomUUID() + "_" + original;
        Path target = root.resolve(stored).normalize();

        if (!target.startsWith(root)) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Path fuori cartella upload");
        }

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Salvataggio file fallito", e);
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Salvataggio file fallito: " + e.getMessage());
        }
        return target.toString();
    }

    /** Carica file originale da path salvato per servirlo (visuale). */
    public Resource loadAsResource(String path) {
        Path filePath = Paths.get(path).normalize();
        if (!filePath.startsWith(root)) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Path fuori cartella upload");
        }
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(NOT_FOUND, "File originale non trovato");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Path file non valido: " + e.getMessage());
        }
    }
}
