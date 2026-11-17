import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ImagePlus,
  Network,
  Plus,
  Save,
  X,
} from 'lucide-react';
import { Link, useParams } from 'react-router';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { ImageUploadModal } from '../components/modals/ImageUploadModal';
import { useArchive } from '../context/ArchiveContext';

export const PairingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, updatePairing, addPairingTimelineEvent, showToast } =
    useArchive();

  const pairing = state.pairings.find((p) => p.id === id) || state.pairings[0];

  const [draftSummary, setDraftSummary] = useState(pairing?.summary || '');
  const [draftResonance, setDraftResonance] = useState(pairing?.resonance ?? 90);
  const [draftAToBQuote, setDraftAToBQuote] = useState(pairing?.aToBQuote || '');
  const [draftBToAQuote, setDraftBToAQuote] = useState(pairing?.bToAQuote || '');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [diagramOpen, setDiagramOpen] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [evDate, setEvDate] = useState('');
  const [evTitle, setEvTitle] = useState('');
  const [evSummary, setEvSummary] = useState('');

  useEffect(() => {
    if (pairing) {
      setDraftSummary(pairing.summary);
      setDraftResonance(pairing.resonance);
      setDraftAToBQuote(pairing.aToBQuote);
      setDraftBToAQuote(pairing.bToAQuote);
    }
  }, [pairing]);

  if (!pairing) {
    return (
      <div className="bg-white rounded-2xl border border-hairline p-10 text-center">
        <p className="text-base font-semibold text-ink">
          페어링 정보를 찾을 수 없습니다.
        </p>
        <Link
          to="/couple"
          className="inline-block mt-4 text-sm font-semibold text-primary hover:underline"
        >
          페어링 갤러리로 돌아가기
        </Link>
      </div>
    );
  }

  const charA =
    state.characters.find((c) => c.id === pairing.charAId) ||
    state.characters[0];
  const charB =
    state.characters.find((c) => c.id === pairing.charBId) ||
    state.characters[1] ||
    state.characters[0];

  const handleSwapCharacter = (slot: 'A' | 'B', nextCharId: string) => {
    const nextChar = state.characters.find((c) => c.id === nextCharId);
    if (!nextChar) return;
    updatePairing(pairing.id, (prev) => {
      const nextAId = slot === 'A' ? nextChar.id : prev.charAId;
      const nextBId = slot === 'B' ? nextChar.id : prev.charBId;
      const aObj = state.characters.find((c) => c.id === nextAId) || charA;
      const bObj = state.characters.find((c) => c.id === nextBId) || charB;
      return {
        ...prev,
        charAId: nextAId,
        charBId: nextBId,
        title: `${aObj.name} × ${bObj.name}`,
      };
    });
    showToast('페어링 인물이 변경되었습니다.');
  };

  const handleSaveChanges = () => {
    updatePairing(pairing.id, (prev) => ({
      ...prev,
      summary: draftSummary,
      resonance: draftResonance,
      aToBQuote: draftAToBQuote,
      bToAQuote: draftBToAQuote,
    }));
    showToast(`${pairing.title} 페어링 설정을 저장했습니다.`);
  };

  const handleAddTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim()) return;
    addPairingTimelineEvent(pairing.id, {
      dateLabel: evDate.trim() || '새 기록',
      title: evTitle.trim(),
      summary: evSummary.trim() || '두 사람의 관계가 한 걸음 더 가까워진 순간.',
      tag: '기록',
    });
    setEvDate('');
    setEvTitle('');
    setEvSummary('');
    setShowAddEvent(false);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-subtle min-w-0">
          <Link
            to="/couple"
            className="inline-flex items-center gap-1 hover:text-ink shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>페어링</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{pairing.universeName}</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold text-ink truncate">{pairing.title}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDiagramOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-hairline text-ink hover:bg-surface-low min-h-[38px]"
          >
            <Network className="w-3.5 h-3.5 text-tertiary" />
            <span>관계도 보기</span>
          </button>

          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-hairline text-ink hover:bg-surface-low min-h-[38px]"
          >
            <ImagePlus className="w-3.5 h-3.5 text-primary" />
            <span>공동 이미지 변경</span>
          </button>

          <button
            type="button"
            onClick={handleSaveChanges}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-container min-h-[38px]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>변경 사항 저장</span>
          </button>
        </div>
      </div>

      {/* TOP 3-TIER VISUAL CANVAS (Char A · Center Joint Artwork · Char B) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Char A Card */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-hairline p-4 flex flex-col justify-between gap-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                인물 A
              </span>
              <select
                value={charA.id}
                onChange={(e) => handleSwapCharacter('A', e.target.value)}
                aria-label="인물 A 선택"
                className="text-xs font-medium px-2 py-1 rounded-lg border border-hairline bg-surface"
              >
                {state.characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="aspect-[3/4] overflow-hidden rounded-xl border border-hairline">
              <CharacterAvatar
                character={charA}
                variant="square"
                className="w-full h-full rounded-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-hairline">
            <div>
              <h2 className="text-base font-bold text-ink">{charA.name}</h2>
              <p className="text-xs text-ink-subtle">{charA.role}</p>
            </div>
            <Link
              to={`/characters/${charA.id}`}
              className="text-xs font-semibold text-primary hover:underline shrink-0"
            >
              시트
            </Link>
          </div>
        </div>

        {/* Center Joint Illustration & Resonance Canvas */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-hairline p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-ink-subtle">
                {pairing.universeName} · {pairing.category} · {pairing.bondLabel}
              </p>
              <h1 className="text-2xl font-bold text-ink mt-1">
                {pairing.title}
              </h1>
              <p className="text-xs text-ink-muted mt-0.5">{pairing.subtitle}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-ink-subtle">서사 공명도</p>
              <p className="text-2xl font-bold text-tertiary tabular-nums">
                {draftResonance}%
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-hairline bg-surface-low">
            {pairing.jointImageUrl ? (
              <img
                src={pairing.jointImageUrl}
                alt={pairing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${pairing.jointGradient} flex flex-col items-center justify-center p-6 text-center`}
              >
                <p className="text-lg font-bold text-ink">{pairing.title}</p>
                <p className="text-xs text-ink-muted mt-1">
                  상단 ‘공동 이미지 변경’ 버튼으로 커플 일러스트를 등록할 수 있습니다.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-subtle">공명도 슬라이더</span>
              <span className="font-semibold text-tertiary tabular-nums">
                {draftResonance}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={draftResonance}
              onChange={(e) => setDraftResonance(Number(e.target.value))}
              className="w-full accent-tertiary cursor-pointer"
            />
          </div>
        </div>

        {/* Char B Card */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-hairline p-4 flex flex-col justify-between gap-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-tertiary uppercase tracking-wider">
                인물 B
              </span>
              <select
                value={charB.id}
                onChange={(e) => handleSwapCharacter('B', e.target.value)}
                aria-label="인물 B 선택"
                className="text-xs font-medium px-2 py-1 rounded-lg border border-hairline bg-surface"
              >
                {state.characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="aspect-[3/4] overflow-hidden rounded-xl border border-hairline">
              <CharacterAvatar
                character={charB}
                variant="square"
                className="w-full h-full rounded-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-hairline">
            <div>
              <h2 className="text-base font-bold text-ink">{charB.name}</h2>
              <p className="text-xs text-ink-subtle">{charB.role}</p>
            </div>
            <Link
              to={`/characters/${charB.id}`}
              className="text-xs font-semibold text-primary hover:underline shrink-0"
            >
              시트
            </Link>
          </div>
        </div>
      </section>

      {/* LOWER 3-COLUMN ENCYCLOPEDIA DETAILS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Char A Perspective */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-hairline p-5 space-y-4">
          <h2 className="text-sm font-bold text-ink">
            {charA.name} → {charB.name}
          </h2>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-subtle">감정 신뢰도</span>
              <span className="font-bold text-primary tabular-nums">
                {pairing.aToBAffection}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-low overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${pairing.aToBAffection}%` }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-subtle mb-1.5">
              상대에게 남기는 한 마디
            </label>
            <textarea
              rows={3}
              value={draftAToBQuote}
              onChange={(e) => setDraftAToBQuote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-hairline bg-surface leading-relaxed focus:outline-none focus:border-primary"
            />
          </div>

          <p className="text-xs text-ink-muted leading-relaxed pt-2 border-t border-hairline">
            {pairing.charANote}
          </p>
        </div>

        {/* Center: Narrative Summary, Speech Comparison Table & Timeline */}
        <div className="lg:col-span-6 space-y-5">
          {/* Narrative Summary */}
          <div className="bg-white rounded-2xl border border-hairline p-5 space-y-3">
            <h2 className="text-sm font-bold text-ink">관계 서사 요약</h2>
            <textarea
              rows={3}
              value={draftSummary}
              onChange={(e) => setDraftSummary(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface leading-relaxed focus:outline-none focus:border-primary"
            />
          </div>

          {/* Speech & Honorifics Comparison Table */}
          <div className="bg-white rounded-2xl border border-hairline p-5 space-y-3">
            <h2 className="text-sm font-bold text-ink">호칭 · 말투 대조표</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline text-ink-subtle">
                    <th className="py-2 pr-3 font-semibold">상황</th>
                    <th className="py-2 pr-3 font-semibold">
                      {charA.name} → {charB.name}
                    </th>
                    <th className="py-2 font-semibold">
                      {charB.name} → {charA.name}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {pairing.speechTable.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 pr-3 font-semibold text-ink whitespace-nowrap">
                        {row.context}
                      </td>
                      <td className="py-2.5 pr-3 text-ink-muted">
                        {row.charAToB}
                      </td>
                      <td className="py-2.5 text-ink-muted">{row.charBToA}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Narrative Timeline Log */}
          <div className="bg-white rounded-2xl border border-hairline p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">공동 서사 연표</h2>
              <button
                type="button"
                onClick={() => setShowAddEvent((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>사건 추가</span>
              </button>
            </div>

            {showAddEvent && (
              <form
                onSubmit={handleAddTimeline}
                className="p-4 rounded-xl bg-surface-low border border-hairline space-y-2.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={evDate}
                    onChange={(e) => setEvDate(e.target.value)}
                    placeholder="시점 (예: 제14장)"
                    className="px-3 py-2 text-xs rounded-lg border border-hairline bg-white"
                  />
                  <input
                    type="text"
                    required
                    value={evTitle}
                    onChange={(e) => setEvTitle(e.target.value)}
                    placeholder="사건 제목 *"
                    className="sm:col-span-2 px-3 py-2 text-xs rounded-lg border border-hairline bg-white"
                  />
                </div>
                <textarea
                  rows={2}
                  value={evSummary}
                  onChange={(e) => setEvSummary(e.target.value)}
                  placeholder="두 캐릭터 사이에서 일어난 변화"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-hairline bg-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddEvent(false)}
                    className="px-3 py-1.5 text-xs text-ink-muted"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg"
                  >
                    연표에 기록
                  </button>
                </div>
              </form>
            )}

            {pairing.timeline.length === 0 ? (
              <p className="text-xs text-ink-subtle py-4 text-center">
                아직 기록된 사건이 없습니다. ‘사건 추가’로 첫 장면을 남겨보세요.
              </p>
            ) : (
              <div className="space-y-3">
                {pairing.timeline.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-surface-low/60 border border-hairline space-y-1"
                  >
                    <p className="text-[11px] font-semibold text-tertiary">
                      {ev.dateLabel} {ev.tag ? `· ${ev.tag}` : ''}
                    </p>
                    <p className="text-sm font-bold text-ink">{ev.title}</p>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {ev.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Char B Perspective */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-hairline p-5 space-y-4">
          <h2 className="text-sm font-bold text-ink">
            {charB.name} → {charA.name}
          </h2>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-subtle">감정 신뢰도</span>
              <span className="font-bold text-tertiary tabular-nums">
                {pairing.bToAAffection}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-low overflow-hidden">
              <div
                className="h-full bg-tertiary rounded-full"
                style={{ width: `${pairing.bToAAffection}%` }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-subtle mb-1.5">
              상대에게 남기는 한 마디
            </label>
            <textarea
              rows={3}
              value={draftBToAQuote}
              onChange={(e) => setDraftBToAQuote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-hairline bg-surface leading-relaxed focus:outline-none focus:border-primary"
            />
          </div>

          <p className="text-xs text-ink-muted leading-relaxed pt-2 border-t border-hairline">
            {pairing.charBNote}
          </p>
        </div>
      </section>

      {/* SVG Relationship Diagram Modal */}
      {diagramOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl border border-hairline shadow-xl w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h2 className="text-base font-bold text-ink">
                {pairing.title} 상호 감정 관계도
              </h2>
              <button
                type="button"
                onClick={() => setDiagramOpen(false)}
                className="p-2 rounded-lg text-ink-subtle hover:text-ink"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <svg
              viewBox="0 0 460 220"
              className="w-full h-auto bg-surface-low/60 rounded-xl border border-hairline"
              role="img"
              aria-label="두 캐릭터 간 양방향 감정 관계도"
            >
              {/* Arrows */}
              <path
                d="M 125 82 Q 230 34 335 82"
                fill="none"
                stroke="#006194"
                strokeWidth="2.5"
                strokeDasharray="5 4"
              />
              <path
                d="M 335 138 Q 230 186 125 138"
                fill="none"
                stroke="#6448b3"
                strokeWidth="2.5"
              />
              {/* Labels */}
              <text
                x="230"
                y="46"
                textAnchor="middle"
                className="fill-primary text-[11px] font-bold"
              >
                신뢰 {pairing.aToBAffection}% · 헌신과 보호
              </text>
              <text
                x="230"
                y="182"
                textAnchor="middle"
                className="fill-tertiary text-[11px] font-bold"
              >
                신뢰 {pairing.bToAAffection}% · 추적과 동행
              </text>
              {/* Node A */}
              <circle
                cx="85"
                cy="110"
                r="42"
                fill="#ffffff"
                stroke="#006194"
                strokeWidth="2.5"
              />
              <text
                x="85"
                y="107"
                textAnchor="middle"
                className="fill-ink text-[15px] font-bold"
              >
                {charA.name}
              </text>
              <text
                x="85"
                y="124"
                textAnchor="middle"
                className="fill-ink-subtle text-[10px]"
              >
                {charA.mbti}
              </text>
              {/* Center Resonance */}
              <rect
                x="185"
                y="94"
                width="90"
                height="32"
                rx="10"
                fill="#ffffff"
                stroke="#dfe4ea"
              />
              <text
                x="230"
                y="114"
                textAnchor="middle"
                className="fill-ink text-[12px] font-bold"
              >
                공명 {draftResonance}%
              </text>
              {/* Node B */}
              <circle
                cx="375"
                cy="110"
                r="42"
                fill="#ffffff"
                stroke="#6448b3"
                strokeWidth="2.5"
              />
              <text
                x="375"
                y="107"
                textAnchor="middle"
                className="fill-ink text-[15px] font-bold"
              >
                {charB.name}
              </text>
              <text
                x="375"
                y="124"
                textAnchor="middle"
                className="fill-ink-subtle text-[10px]"
              >
                {charB.mbti}
              </text>
            </svg>
          </div>
        </div>
      )}

      <ImageUploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        allowCategory={false}
        titleText={`${pairing.title} 공동 일러스트 등록`}
        onSubmit={(payload) => {
          updatePairing(pairing.id, (prev) => ({
            ...prev,
            jointImageUrl: payload.url,
          }));
          showToast('공동 일러스트가 업데이트되었습니다.');
        }}
      />
    </div>
  );
};
