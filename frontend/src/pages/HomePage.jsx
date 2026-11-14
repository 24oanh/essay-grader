import EssayInput from "../components/EssayInput";
import ScoreCard from "../components/ScoreCard";
import CriteriaChart from "../components/CriteriaChart";
import WordHighlight from "../components/WordHighlight";
import WhiteBoxXAI from "../components/WhiteBoxXAI";
import useScoreEssay from "../hooks/useScoreEssay";

export default function HomePage() {
  const { result, loading, error, submit } = useScoreEssay();

  return (
    <div className="space-y-6">
      <EssayInput onSubmit={submit} loading={loading} />

      {error && <p className="text-red-600">{error}</p>}

      {result && (
        <div className="space-y-4">
          <ScoreCard score={result.score} />
          <CriteriaChart criteria={result.criteria} />
          <WhiteBoxXAI criteria={result.criteria} score={result.score} />
          <WordHighlight explanation={result.explanation} />
        </div>
      )}
    </div>
  );
}
