// 10 tiêu chí của model (khớp CRIT trong model-service/main.py và CriteriaKeys.java)
export const CRITERIA_KEYS = [
    "intelligibility", "complexity", "accuracy", "fluency",
    "comprehensibility", "logicality", "sophistication", "purposefulness",
    "willingness", "involvement",
];

export const CRITERIA_LABELS = {
    intelligibility: "Dễ hiểu",
    complexity: "Độ phức tạp",
    accuracy: "Chính xác",
    fluency: "Trôi chảy",
    comprehensibility: "Dễ lĩnh hội",
    logicality: "Tính logic",
    sophistication: "Sự tinh tế",
    purposefulness: "Có mục đích",
    willingness: "Sự sẵn sàng",
    involvement: "Sự tham gia",
};

// Nhóm của từng tiêu chí trong bộ dữ liệu huấn luyện
export const CRITERIA_GROUPS = {
    intelligibility: "Ngôn ngữ",
    complexity: "Ngôn ngữ",
    accuracy: "Ngôn ngữ",
    fluency: "Ngôn ngữ",
    comprehensibility: "Nội dung",
    logicality: "Nội dung",
    sophistication: "Nội dung",
    purposefulness: "Nội dung",
    willingness: "Thái độ",
    involvement: "Thái độ",
};

// Trọng số mặc định khi giáo viên tạo rubric (10 tiêu chí × 10 = 100)
export const DEFAULT_WEIGHT = 10;
