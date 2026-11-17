import React, { useEffect, useState } from 'react';
import { Plus, Sliders, Trash2, X } from 'lucide-react';
import type {
  Character,
  CharacterArtifact,
  CharacterRadarStats,
  CharacterRelationLink,
} from '../../types/archive';

interface CharacterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  allCharacters: Character[];
  onSave: (updated: Character) => void;
}

type ModalTab = 'personality' | 'stats' | 'relations';

const STAT_LABELS: { key: keyof CharacterRadarStats; label: string }[] = [
  { key: 'combat', label: '전투력 / 행동력' },
  { key: 'intellect', label: '지략 / 통찰' },
  { key: 'charm', label: '매력 / 교섭' },
  { key: 'willpower', label: '의지 / 정신력' },
  { key: 'agility', label: '민첩 / 기동성' },
];

export const CharacterSettingsModal: React.FC<CharacterSettingsModalProps> = ({
  isOpen,
  onClose,
  character,
  allCharacters,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('personality');
  const [draft, setDraft] = useState<Character>(character);
  const [tagInput, setTagInput] = useState('');
  const [likesText, setLikesText] = useState('');
  const [dislikesText, setDislikesText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDraft(character);
      setLikesText(character.likes.join(', '));
      setDislikesText(character.dislikes.join(', '));
    }
  }, [isOpen, character]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (!clean || draft.tags.includes(clean)) return;
    setDraft((prev) => ({ ...prev, tags: [...prev.tags, clean] }));
    setTagInput('');
  };

  const handleAddArtifact = () => {
    const newArtifact: CharacterArtifact = {
      id: `art-${Date.now()}`,
      name: '새 아티팩트',
      kind: '소지품',
      description: '세부 효과를 입력하세요.',
    };
    setDraft((prev) => ({
      ...prev,
      artifacts: [...prev.artifacts, newArtifact],
    }));
  };

  const handleAddRelation = () => {
    const candidate =
      allCharacters.find(
        (c) =>
          c.id !== character.id &&
          !draft.relations.some((r) => r.targetId === c.id)
      ) || allCharacters.find((c) => c.id !== character.id);

    if (!candidate) return;
    const newRel: CharacterRelationLink = {
      targetId: candidate.id,
      targetName: candidate.name,
      relationLabel: '동료',
      summary: '두 캐릭터 사이의 관계 서사를 적어보세요.',
    };
    setDraft((prev) => ({ ...prev, relations: [...prev.relations, newRel] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedLikes = likesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const cleanedDislikes = dislikesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      ...draft,
      likes: cleanedLikes,
      dislikes: cleanedDislikes,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="char-settings-title"
    >
      <div className="bg-white rounded-2xl border border-hairline shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            <h2 id="char-settings-title" className="text-base font-bold text-ink">
              {character.name} 상세 설정 편집
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-ink-subtle hover:text-ink hover:bg-surface-low transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Tab Switcher */}
        <div className="flex border-b border-hairline px-6 gap-6 bg-surface-low/50 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'personality' as const, label: '성격 · 말투 · 태그' },
            { id: 'stats' as const, label: '능력치 · 아티팩트' },
            { id: 'relations' as const, label: '인물 관계도' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'personality' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                    캐릭터 한 줄 대사
                  </label>
                  <input
                    type="text"
                    value={draft.quote}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, quote: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                    보이스 톤 & 연기 노트
                  </label>
                  <input
                    type="text"
                    value={draft.voiceTone}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, voiceTone: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                  성격 및 가치관 서술
                </label>
                <textarea
                  rows={3}
                  value={draft.personalitySummary}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, personalitySummary: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                  말투 특징
                </label>
                <textarea
                  rows={2}
                  value={draft.speechStyle}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, speechStyle: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                    좋아하는 것 (쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    value={likesText}
                    onChange={(e) => setLikesText(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                    싫어하는 것 (쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    value={dislikesText}
                    onChange={(e) => setDislikesText(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                  키워드 태그
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="태그 입력 후 추가"
                    className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 text-xs font-semibold text-primary border border-primary/30 rounded-xl hover:bg-primary-fixed/30 transition-colors"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {draft.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setDraft((p) => ({
                          ...p,
                          tags: p.tags.filter((t) => t !== tag),
                        }))
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-danger px-2.5 py-1 rounded-lg bg-surface-low border border-hairline"
                    >
                      <span>#{tag}</span>
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'stats' && (
            <>
              <div className="space-y-3 bg-surface-low/60 p-4 rounded-xl border border-hairline">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                  레이더 능력치 스탯 (0–100)
                </h3>
                {STAT_LABELS.map((stat) => (
                  <div key={stat.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink-muted">
                        {stat.label}
                      </span>
                      <span className="font-bold text-primary tabular-nums">
                        {draft.radarStats[stat.key]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={draft.radarStats[stat.key]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDraft((p) => ({
                          ...p,
                          radarStats: { ...p.radarStats, [stat.key]: val },
                        }));
                      }}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                    고유 능력명
                  </label>
                  <input
                    type="text"
                    value={draft.abilityName}
                    onChange={(e) =>
                      setDraft((p) => ({ ...p, abilityName: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                    능력 상세 및 제약 조건
                  </label>
                  <textarea
                    rows={3}
                    value={draft.abilitySummary}
                    onChange={(e) =>
                      setDraft((p) => ({
                        ...p,
                        abilitySummary: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-ink">아티팩트 · 소지품</h3>
                  <button
                    type="button"
                    onClick={handleAddArtifact}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>아티팩트 추가</span>
                  </button>
                </div>
                {draft.artifacts.map((art, index) => (
                  <div
                    key={art.id}
                    className="p-3.5 rounded-xl border border-hairline bg-surface-low/40 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={art.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((p) => ({
                            ...p,
                            artifacts: p.artifacts.map((a, i) =>
                              i === index ? { ...a, name: val } : a
                            ),
                          }));
                        }}
                        placeholder="소지품 이름"
                        className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-hairline bg-white"
                      />
                      <input
                        type="text"
                        value={art.kind}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((p) => ({
                            ...p,
                            artifacts: p.artifacts.map((a, i) =>
                              i === index ? { ...a, kind: val } : a
                            ),
                          }));
                        }}
                        placeholder="분류"
                        className="w-28 px-3 py-1.5 text-sm rounded-lg border border-hairline bg-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((p) => ({
                            ...p,
                            artifacts: p.artifacts.filter((_, i) => i !== index),
                          }))
                        }
                        className="p-1.5 text-ink-subtle hover:text-danger"
                        aria-label="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={art.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraft((p) => ({
                          ...p,
                          artifacts: p.artifacts.map((a, i) =>
                            i === index ? { ...a, description: val } : a
                          ),
                        }));
                      }}
                      placeholder="설명"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-hairline bg-white"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'relations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-ink-muted">
                  이 캐릭터와 연결된 주요 인물과 관계 정의를 편집합니다.
                </p>
                <button
                  type="button"
                  onClick={handleAddRelation}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>관계 추가</span>
                </button>
              </div>

              {draft.relations.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-hairline text-xs text-ink-subtle">
                  등록된 관계가 없습니다. 상단 버튼으로 새 관계를 연결해보세요.
                </div>
              ) : (
                draft.relations.map((rel, index) => (
                  <div
                    key={`${rel.targetId}-${index}`}
                    className="p-4 rounded-xl border border-hairline bg-surface-low/40 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={rel.targetId}
                        onChange={(e) => {
                          const target = allCharacters.find(
                            (c) => c.id === e.target.value
                          );
                          if (!target) return;
                          setDraft((p) => ({
                            ...p,
                            relations: p.relations.map((r, i) =>
                              i === index
                                ? {
                                    ...r,
                                    targetId: target.id,
                                    targetName: target.name,
                                  }
                                : r
                            ),
                          }));
                        }}
                        className="px-3 py-1.5 text-sm rounded-lg border border-hairline bg-white font-medium"
                      >
                        {allCharacters
                          .filter((c) => c.id !== character.id)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.universeName})
                            </option>
                          ))}
                      </select>

                      <input
                        type="text"
                        value={rel.relationLabel}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDraft((p) => ({
                            ...p,
                            relations: p.relations.map((r, i) =>
                              i === index ? { ...r, relationLabel: val } : r
                            ),
                          }));
                        }}
                        placeholder="관계 호칭 (예: 서약자, 라이벌)"
                        className="flex-1 min-w-[140px] px-3 py-1.5 text-sm rounded-lg border border-hairline bg-white"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setDraft((p) => ({
                            ...p,
                            relations: p.relations.filter((_, i) => i !== index),
                          }))
                        }
                        className="p-1.5 text-ink-subtle hover:text-danger"
                        aria-label="관계 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={rel.summary}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraft((p) => ({
                          ...p,
                          relations: p.relations.map((r, i) =>
                            i === index ? { ...r, summary: val } : r
                          ),
                        }));
                      }}
                      placeholder="관계 설명"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-hairline bg-white"
                    />
                  </div>
                ))
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink rounded-xl hover:bg-surface-low transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-container rounded-xl transition-colors"
            >
              변경 사항 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
