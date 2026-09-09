package com.epicode.documentarchive.service;

import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@Service
@Slf4j
public class OcrService {

    private final String tessdataPath;

    public OcrService(@Value("${ocr.tessdata-path}") String tessdataPath) {
        this.tessdataPath = tessdataPath;
    }

    /**
     * Riceve bytecode documento + nome file + lingua scelta, esegue OCR, ritorna testo.
     * Scrive un file temporaneo con l'estensione originale cosi' tess4j sceglie il loader
     * corretto (PNG, JPEG, TIFF, BMP, GIF, PDF).
     */
    public String extractText(byte[] data, String filename, String language) {
        String ext = StringUtils.getFilenameExtension(filename);
        String suffix = ext == null ? ".tmp" : "." + ext.toLowerCase();

        Path temp = null;
        try {
            temp = Files.createTempFile("ocr-", suffix);
            Files.write(temp, data);

            ITesseract tesseract = new Tesseract();
            tesseract.setDatapath(tessdataPath);
            tesseract.setLanguage(language);
            return tesseract.doOCR(temp.toFile());
        } catch (TesseractException e) {
            log.error("OCR fallito", e);
            throw new ResponseStatusException(BAD_REQUEST,
                    "Formato non leggibile o OCR fallito: " + e.getMessage());
        } catch (IOException e) {
            log.error("Scrittura file temporaneo fallita", e);
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR,
                    "Elaborazione file fallita: " + e.getMessage());
        } finally {
            if (temp != null) {
                try {
                    Files.deleteIfExists(temp);
                } catch (IOException e) {
                    log.warn("Rimozione file temporaneo fallita: {}", temp, e);
                }
            }
        }
    }
}
