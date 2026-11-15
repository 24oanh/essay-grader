package com.example.essayscoring.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public final class FileTextExtractor {

    private FileTextExtractor() {
    }

    public static String extract(MultipartFile file) {
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        if (!name.endsWith(".txt") && !name.endsWith(".docx") && !name.endsWith(".pdf")) {
            throw new IllegalArgumentException("Định dạng không được hỗ trợ (chỉ .txt, .docx, .pdf)");
        }

        String text;
        try {
            byte[] bytes = file.getBytes();
            if (name.endsWith(".txt"))
                text = new String(bytes, StandardCharsets.UTF_8);
            else if (name.endsWith(".docx"))
                text = readDocx(bytes);
            else
                text = readPdf(bytes);
        } catch (IOException | RuntimeException ex) {
            throw new IllegalArgumentException("File bị lỗi hoặc không đọc được");
        }

        if (text.isBlank()) {
            throw new IllegalArgumentException("Không đọc được nội dung (file rỗng hoặc PDF dạng ảnh scan)");
        }
        return text;
    }

    private static String readDocx(byte[] bytes) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(bytes));
                XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            return extractor.getText();
        }
    }

    private static String readPdf(byte[] bytes) throws IOException {
        try (PDDocument doc = Loader.loadPDF(bytes)) {
            return new PDFTextStripper().getText(doc);
        }
    }
}