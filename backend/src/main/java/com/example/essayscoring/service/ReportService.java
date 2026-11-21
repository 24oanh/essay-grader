package com.example.essayscoring.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.essayscoring.dto.ClassStats;
import com.example.essayscoring.entity.Assignment;
import com.example.essayscoring.entity.EssayResult;
import com.example.essayscoring.entity.User;

@Service
public class ReportService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final String[] CRITERIA = CriteriaKeys.ALL.toArray(new String[0]);

    private final StatsService stats;
    private final EssayService essayService;

    public ReportService(StatsService stats, EssayService essayService) {
        this.stats = stats;
        this.essayService = essayService;
    }

    /**
     * File Excel 2 sheet: "Thống kê" và "Danh sách". Chỉ chủ đề bài mới xuất được.
     */
    @Transactional(readOnly = true)
    public byte[] classReport(Long assignmentId, User teacher) {
        Assignment a = stats.ownedAssignment(assignmentId, teacher);
        ClassStats s = stats.classStats(assignmentId, teacher);
        List<EssayResult> rows = new ArrayList<>(stats.latestSubmissions(a));
        rows.sort(Comparator.comparing(e -> e.getOwner().getUsername(), String.CASE_INSENSITIVE_ORDER));

        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Font boldFont = wb.createFont();
            boldFont.setBold(true);

            Font titleFont = wb.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);

            CellStyle bold = wb.createCellStyle();
            bold.setFont(boldFont);

            CellStyle title = wb.createCellStyle();
            title.setFont(titleFont);

            CellStyle header = wb.createCellStyle();
            header.setFont(boldFont);
            header.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            header.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            writeSummary(wb.createSheet("Thống kê"), s, teacher, title, bold, header);
            writeList(wb.createSheet("Danh sách"), rows, header);

            wb.write(out);
            return out.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Không tạo được file Excel", ex);
        }
    }

    private void writeSummary(Sheet sh, ClassStats s, User teacher,
            CellStyle title, CellStyle bold, CellStyle header) {
        sh.setColumnWidth(0, 28 * 256);
        sh.setColumnWidth(1, 40 * 256);

        int r = 0;
        Cell t = sh.createRow(r++).createCell(0);
        t.setCellValue("BÁO CÁO ĐIỂM");
        t.setCellStyle(title);
        r++;

        put(sh, r++, "Đề bài", s.title(), bold);
        put(sh, r++, "Giáo viên", teacher.getUsername(), bold);
        put(sh, r++, "Ngày xuất", LocalDateTime.now().format(FMT), bold);
        r++;

        put(sh, r++, "Số học sinh", s.count(), bold);
        put(sh, r++, "Điểm trung bình", s.average(), bold);
        put(sh, r++, "Trung vị", s.median(), bold);
        put(sh, r++, "Cao nhất", s.max(), bold);
        put(sh, r++, "Thấp nhất", s.min(), bold);
        put(sh, r++, "Độ lệch chuẩn", s.stdDev(), bold);
        r++;

        Row h = sh.createRow(r++);
        Cell h0 = h.createCell(0);
        h0.setCellValue("Khoảng điểm");
        h0.setCellStyle(header);
        Cell h1 = h.createCell(1);
        h1.setCellValue("Số học sinh");
        h1.setCellStyle(header);

        for (int i = 0; i < s.distribution().size(); i++) {
            put(sh, r++, i + "-" + (i + 1), s.distribution().get(i), null);
        }
    }

    private void writeList(Sheet sh, List<EssayResult> rows, CellStyle header) {
        String[] heads = { "STT", "Học sinh", "Điểm tổng",
                "Dễ hiểu", "Độ phức tạp", "Chính xác", "Trôi chảy",
                "Dễ lĩnh hội", "Logic", "Tinh tế", "Mục đích",
                "Sẵn sàng", "Tham gia",
                "Trạng thái", "Thời gian nộp" };
        int[] widths = { 6, 24, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 26, 20 };

        Row h = sh.createRow(0);
        for (int i = 0; i < heads.length; i++) {
            Cell c = h.createCell(i);
            c.setCellValue(heads[i]);
            c.setCellStyle(header);
            sh.setColumnWidth(i, widths[i] * 256);
        }
        sh.createFreezePane(0, 1);

        int r = 1;
        for (EssayResult e : rows) {
            Map<String, Double> override = essayService.readCriteria(e.getCriteriaOverrideJson());
            Map<String, Double> criteria = override != null
                    ? override
                    : essayService.fromJson(e.getDetailJson()).criteria();

            Row row = sh.createRow(r);
            row.createCell(0).setCellValue(r);
            row.createCell(1).setCellValue(e.getOwner().getUsername());
            row.createCell(2).setCellValue(e.getScore());
            for (int i = 0; i < CRITERIA.length; i++) {
                Double v = criteria.get(CRITERIA[i]);
                Cell c = row.createCell(3 + i);
                if (v == null)
                    c.setCellValue("-");
                else
                    c.setCellValue(v);
            }
            int statusCol = 3 + CRITERIA.length;
            row.createCell(statusCol).setCellValue(e.isHumanReviewed() ? "Giáo viên đã chấm lại" : "Điểm AI");
            row.createCell(statusCol + 1).setCellValue(e.getCreatedAt().format(FMT));
            r++;
        }
    }

    private static void put(Sheet sh, int r, String label, Object value, CellStyle labelStyle) {
        Row row = sh.createRow(r);
        Cell c0 = row.createCell(0);
        c0.setCellValue(label);
        if (labelStyle != null)
            c0.setCellStyle(labelStyle);

        Cell c1 = row.createCell(1);
        if (value instanceof Number n)
            c1.setCellValue(n.doubleValue());
        else
            c1.setCellValue(value == null ? "-" : value.toString());
    }
}