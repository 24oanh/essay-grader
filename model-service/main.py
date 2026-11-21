import json
import os

import numpy as np
import torch
import torch.nn as nn
from fastapi import FastAPI, HTTPException
from peft import LoraConfig, get_peft_model, set_peft_model_state_dict
from pydantic import BaseModel
from safetensors.torch import load_file
from transformers import AutoModel, AutoTokenizer
from huggingface_hub import snapshot_download

BASE_DIR = snapshot_download(
    repo_id=os.environ.get("MODEL_REPO", "Oanhoanh/aes-roberta"),
    token=os.environ.get("HF_TOKEN"),
)
MODEL_NAME = "roberta-base"
TAG = "roberta_base_aug_dec"
N_FOLDS = 5
MAX_LEN = 512
LORA_R, LORA_ALPHA, LORA_DROPOUT = 16, 32, 0.1
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

CRIT = [
    "Intelligibility (Language)", "Complexity (Language)", "Accuracy (Language)", "Fluency (Language)",
    "Comprehensibility (Content)", "Logicality (Content)", "Sophistication (Content)", "Purposefulness (Content)",
    "Willingness (Attitude)", "Involvement (Attitude)",
]
HOL = "Holistic Score (/100)"

tokenizer = AutoTokenizer.from_pretrained(os.path.join(BASE_DIR, "tokenizer"))


class ConceptBottleneckAES(nn.Module):
    """Copy nguyên từ notebook: encoder (LoRA) -> 10 điểm tiêu chí -> điểm tổng."""

    def __init__(self):
        super().__init__()
        enc = AutoModel.from_pretrained(MODEL_NAME)
        lcfg = LoraConfig(r=LORA_R, lora_alpha=LORA_ALPHA, lora_dropout=LORA_DROPOUT,
                          target_modules=["query", "key", "value"])
        self.encoder = get_peft_model(enc, lcfg)
        h = enc.config.hidden_size
        self.drop = nn.Dropout(0.1)
        self.concept_head = nn.Linear(h, len(CRIT))
        self.holistic_head = nn.Linear(len(CRIT), 1)

    def forward(self, ids, mask):
        hs = self.encoder(input_ids=ids, attention_mask=mask).last_hidden_state
        m = mask.unsqueeze(-1).to(hs.dtype)
        pooled = (hs * m).sum(1) / m.sum(1).clamp(min=1)
        concepts = self.concept_head(self.drop(pooled).float())
        hol = self.holistic_head(concepts).squeeze(-1)
        return concepts, hol


def load_fold_model(f):
    m = ConceptBottleneckAES()
    lora_path = os.path.join(BASE_DIR, f"lora_{TAG}_fold{f}", "adapter_model.safetensors")
    set_peft_model_state_dict(m.encoder, load_file(lora_path))
    hd = torch.load(os.path.join(BASE_DIR, f"heads_{TAG}_fold{f}.pt"), map_location="cpu")
    m.concept_head.load_state_dict(hd["concept_head"])
    m.holistic_head.load_state_dict(hd["holistic_head"])
    return m.to(DEVICE).eval()


# ====== Hệ số hiệu chỉnh (a, b) của từng fold: điểm thật = a * dự đoán + b ======
CAL = None
cal_path = os.path.join(BASE_DIR, "calibration.json")
if os.path.exists(cal_path):
    with open(cal_path, encoding="utf-8") as fp:
        CAL = json.load(fp)
    print("Đã nạp calibration.json")
else:
    print("CẢNH BÁO: không thấy calibration.json -> dùng điểm thô, chưa hiệu chỉnh (điểm có thể lệch).")


def apply_cal(f, concepts, hol):
    """concepts: mảng 10 phần tử (thang 0-10), hol: số (thang 0-100)."""
    if CAL is None:
        return np.clip(concepts, 0, 10), float(np.clip(hol, 0, 100))
    c = CAL[str(f)]
    cc = np.array([np.clip(c[t][0] * concepts[k] + c[t][1], 0, 10) for k, t in enumerate(CRIT)])
    hc = float(np.clip(c[HOL][0] * hol + c[HOL][1], 0, 100))
    return cc, hc


# Nạp 1 lần khi khởi động (không nạp lại mỗi request)
models = [load_fold_model(f) for f in range(N_FOLDS)]
print(f"Đã nạp {len(models)} fold trên {DEVICE}")

app = FastAPI()


class EssayRequest(BaseModel):
    essay: str


@torch.no_grad()
def score_essay(text):
    enc = tokenizer(text, truncation=True, max_length=MAX_LEN, return_tensors="pt")
    ids, mask = enc["input_ids"].to(DEVICE), enc["attention_mask"].to(DEVICE)

    all_c, all_h = [], []
    for f, model in enumerate(models):
        c, h = model(ids, mask)
        c = c[0].float().cpu().numpy() * 10.0      # về thang gốc 0-10
        h = float(h[0].float().cpu()) * 100.0       # về thang gốc 0-100
        cc, hc = apply_cal(f, c, h)
        all_c.append(cc)
        all_h.append(hc)

    return np.mean(all_c, axis=0), float(np.mean(all_h))


@app.get("/health")
def health():
    return {"status": "ok", "folds": len(models), "device": DEVICE, "calibrated": CAL is not None}


@app.post("/predict")
def predict(req: EssayRequest):
    text = req.essay.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Bài luận trống")
    criteria, holistic = score_essay(text)
    return {
        "score": round(holistic, 2),  # điểm tổng, thang 0-100
        "criteria": {t: round(float(criteria[k]), 2) for k, t in enumerate(CRIT)},  # mỗi tiêu chí thang 0-10
        "calibrated": CAL is not None,
    }