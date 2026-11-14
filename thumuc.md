essay-scoring-xai/
├── frontend/                      # React + Vite (JavaScript)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── essayApi.js        # Gọi REST API tới Spring Boot
│   │   ├── components/
│   │   │   ├── EssayInput.jsx     # Ô nhập/dán bài luận
│   │   │   ├── ScoreCard.jsx      # Hiển thị điểm tổng
│   │   │   ├── CriteriaChart.jsx  # Biểu đồ điểm theo tiêu chí
│   │   │   ├── WordHighlight.jsx  # Tô màu từ theo mức đóng góp (XAI)
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx       # Nhập bài + xem kết quả
│   │   │   └── HistoryPage.jsx    # Lịch sử chấm
│   │   ├── hooks/
│   │   │   └── useScoreEssay.js
│   │   ├── utils/
│   │   │   └── colorScale.js      # Chuyển trọng số -> màu
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env                       # VITE_API_URL=http://localhost:8080
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                       # Java Spring Boot
│   ├── src/main/java/com/example/essayscoring/
│   │   ├── EssayScoringApplication.java
│   │   ├── controller/
│   │   │   └── EssayController.java
│   │   ├── service/
│   │   │   ├── EssayService.java
│   │   │   └── ModelClientService.java   # Gọi Python service
│   │   ├── dto/
│   │   │   ├── EssayRequest.java
│   │   │   └── ScoreResponse.java        # điểm + trọng số XAI
│   │   ├── entity/
│   │   │   └── EssayResult.java
│   │   ├── repository/
│   │   │   └── EssayResultRepository.java
│   │   └── config/
│   │       └── CorsConfig.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── model-service/                 # Python (FastAPI): mô hình + XAI
│   ├── app/
│   │   ├── main.py
│   │   ├── scorer.py              # Chấm điểm
│   │   └── explainer.py           # SHAP/LIME
│   ├── models/                    # File mô hình đã huấn luyện
│   └── requirements.txt
│
└── README.md

client ID: 902092953198-9s0sckf0k4l3mmau48tj2c8n27sfcc4a.apps.googleusercontent.com