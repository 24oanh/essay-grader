import { CRITERIA_KEYS, CRITERIA_LABELS } from "../utils/criteria";

export default function RubricView({ rubric }) {
    return (
        <ul className="space-y-1 text-sm text-gray-600">
            {CRITERIA_KEYS.map(
                (k) =>
                    rubric[k] && (
                        <li key={k}>
                            <span className="font-medium text-gray-700">{CRITERIA_LABELS[k]}</span> ({rubric[k].weight}%)
                            {rubric[k].description && `: ${rubric[k].description}`}
                        </li>
                    )
            )}
        </ul>
    );
}