import { useState } from "react";
import { scoreEssay } from "../api/essayApi";
import { addHistory } from "../utils/historyStorage";

export default function useScoreEssay() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (text) => {
    setLoading(true);
    setError("");
    try {
      const data = await scoreEssay(text);
      setResult(data);
      addHistory(text, data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, submit };
}