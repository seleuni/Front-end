import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Circle,
  HeartHandshake,
  ImagePlus,
  Lock,
  Sliders,
  Volume2,
  ZoomIn,
  X,
} from 'lucide-react';
import { Link, useParams } from 'react-router';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { RadarChart } from '../components/RadarChart';
import { CharacterSettingsModal } from '../components/modals/CharacterSettingsModal';
import { ImageUploadModal } from '../components/modals/ImageUploadModal';
import { useArchive } from '../context/ArchiveContext';
import type { ImageCategory } from '../types/archive';

type DetailTab = 'appearance' | 'personality' | 'ability' | 'timeline' | 'secret';
type GalleryFilter = '전체' | ImageCategory;

export const CharacterDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    state,
    toggleBookmark,
    updateCharacter,
    addCharacterImage,
    toggleCheckpoint,
    showToast,
  } = useArchive();

  const character =
    state.characters.find((c) => c.id === id) || state.characters[0];

  const [detailTab, setDetailTab] = useState<DetailTab>('appearance');
  const [galleryFilter, setGalleryFilter] = useState<GalleryFilter>('전체');
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [memoDraft, setMemoDraft] = useState(character?.episodeMemo || '');

  React.useEffect(() => {
    setMemoDraft(character?.episodeMemo || '');
    setSelectedImageIdx(0);
  }, [character?.id, character?.episodeMemo]);

  const filteredImages = useMemo(() => {
    if (!character) return [];
    if (galleryFilter === '전체') return character.images;
    return character.images.filter((img) => img.category === galleryFilter);
  }, [character, galleryFilter]);

  const activeImage =
    filteredImages[selectedImageIdx] ||
    filteredImages[0] ||
    (character?.avatarUrl
      ? {
          id: 'default-avatar',
          url: character.avatarUrl,
          title: `${character.name} 기본 일러스트`,
          category: '대표 전신' as const,
          note: character.alias,
          createdAt: character.updatedAt,
        }
      : null);

  const linkedCheckpoints = useMemo(() => {
    if (!character) return [];
    return state.checkpoints.filter((cp) => cp.characterId === character.id);
  }, [state.checkpoints, character]);

  const keyPairing = useMemo(() => {
    if (!character) return undefined;
    return state.pairings.find(
      (p) => p.charAId === character.id || p.charBId === character.id
    );
  }, [state.pairings, character]);

  if (!character) {
    return (
      <div className="bg-white rounded-2xl border border-hairline p-10 text-center">
        <p className="text-base font-semibold text-ink">
          캐릭터 정보를 찾을 수 없습니다.
        </p>
        <Link
          to="/characters"
          className="inline-block mt-4 text-sm font-semibold text-primary hover:underline"
        >
          아카이브로 돌아가기
        </Link>
      </div>
    );
  }

  const handleVoicePreview = () => {
    setIsPlayingVoice((prev) => !prev);
    if (!isPlayingVoice) {
      setTimeout(() => setIsPlayingVoice(false), 3200);
    }
  };

  const handleSaveMemo = () => {
    updateCharacter(character.id, (prev) => ({
      ...prev,
      episodeMemo: memoDraft,
    }));
    showToast('에피소드 메모가 저장되었습니다.');
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-subtle min-w-0">
          <Link
            to="/characters"
            className="inline-flex items-center gap-1 hover:text-ink shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>캐릭터</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{character.universeName}</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold text-ink truncate">
            {character.name}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => toggleBookmark(character.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors min-h-[38px] ${
              character.bookmarked
                ? 'bg-primary-fixed/40 text-primary border-primary/30'
                : 'bg-white text-ink-muted border-hairline hover:text-ink'
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${character.bookmarked ? 'fill-current' : ''}`}
            />
            <span>{character.bookmarked ? '즐겨찾기됨' : '즐겨찾기'}</span>
          </button>

          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-hairline text-ink hover:bg-surface-low transition-colors min-h-[38px]"
          >
            <ImagePlus className="w-3.5 h-3.5 text-primary" />
            <span>새 이미지 등록</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-container transition-colors min-h-[38px]"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>상세 설정 편집</span>
          </button>
        </div>
      </div>

      {/* 3-Column Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT (3 cols): Profile Specs, Voice Preview, Flags & Key Pairing */}
        <aside className="lg:col-span-3 space-y-5">
          <section className="bg-white rounded-2xl border border-hairline p-5 space-y-4">
            <div className="flex items-center gap-3.5">
              <CharacterAvatar
                character={character}
                variant="circle"
                className="w-16 h-16 shrink-0 border border-hairline"
              />
              <div className="min-w-0">
                <p className="text-xs text-primary font-semibold truncate">
                  {character.universeName}
                </p>
                <h1 className="text-xl font-bold text-ink truncate">
                  {character.name}
                </h1>
                <p className="text-xs text-ink-subtle font-display truncate">
                  {character.englishName}
                </p>
              </div>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              {character.alias} · {character.role}
            </p>

            {/* Completion Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-subtle">프로필 완성도</span>
                <span className="font-bold text-primary tabular-nums">
                  {character.completion}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-low overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${character.completion}%` }}
                />
              </div>
            </div>

            {/* Spec Table */}
            <dl className="divide-y divide-hairline text-xs pt-2 border-t border-hairline">
              {[
                ['나이', character.age],
                ['신장', character.height],
                ['생일', character.birthday],
                ['MBTI', character.mbti],
                ['성별', character.gender],
                ['출신', character.origin],
              ].map(([label, val]) => (
                <div key={label} className="py-2 flex items-center justify-between gap-2">
                  <dt className="text-ink-subtle">{label}</dt>
                  <dd className="font-medium text-ink text-right">{val}</dd>
                </div>
              ))}
            </dl>

            {/* Color Palette */}
            <div className="pt-2 border-t border-hairline flex items-center justify-between">
              <span className="text-xs text-ink-subtle">시그니처 팔레트</span>
              <div className="flex items-center gap-1.5">
                {character.palette.map((hex) => (
                  <span
                    key={hex}
                    title={hex}
                    className="w-4 h-4 rounded-full border border-black/10"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Voice Preview Card */}
          <section className="bg-white rounded-2xl border border-hairline p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">보이스 & 대사 톤</h2>
              <button
                type="button"
                onClick={handleVoicePreview}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  isPlayingVoice
                    ? 'bg-primary text-white'
                    : 'bg-surface-low text-primary hover:bg-primary-fixed/40'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlayingVoice ? '재생 중' : '톤 확인'}</span>
              </button>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {character.voiceTone}
            </p>
            <p className="text-[11px] text-ink-subtle bg-surface-low/80 p-3 rounded-xl leading-relaxed">
              {character.quote}
            </p>
          </section>

          {/* Key Pairing Anchor */}
          {keyPairing && (
            <section className="bg-white rounded-2xl border border-hairline p-5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-tertiary">
                <HeartHandshake className="w-4 h-4" />
                <h2 className="text-sm font-bold text-ink">연결된 페어링</h2>
              </div>
              <p className="text-sm font-bold text-ink">{keyPairing.title}</p>
              <p className="text-xs text-ink-muted leading-relaxed">
                {keyPairing.bondLabel} · 공명 {keyPairing.resonance}%
              </p>
              <Link
                to={`/couple/${keyPairing.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-1"
              >
                <span>페어링 백과사전 열기</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </section>
          )}
        </aside>

        {/* CENTER (5 cols): Artwork Gallery Showcase */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-hairline p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-ink">아트워크 갤러리</h2>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(['전체', '대표 전신', '표정 시트', 'SD·설정화', '팬아트'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setGalleryFilter(cat);
                      setSelectedImageIdx(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      galleryFilter === cat
                        ? 'bg-ink text-white'
                        : 'text-ink-muted hover:bg-surface-low'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Main Showcase Frame */}
          <div className="relative rounded-2xl overflow-hidden border border-hairline bg-surface-low aspect-[3/4] flex items-center justify-center">
            {activeImage ? (
              <>
                <img
                  src={activeImage.url}
                  alt={activeImage.title}
                  className="w-full h-full object-cover object-top"
                />
                <button
                  type="button"
                  onClick={() => setLightboxUrl(activeImage.url)}
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-xs text-xs font-semibold text-ink border border-hairline hover:bg-white transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>크게 보기</span>
                </button>
              </>
            ) : (
              <CharacterAvatar
                character={character}
                variant="square"
                className="w-full h-full rounded-none"
              />
            )}
          </div>

          {activeImage && (
            <div className="flex items-center justify-between text-xs px-1">
              <div>
                <p className="font-semibold text-ink">{activeImage.title}</p>
                {activeImage.note && (
                  <p className="text-ink-subtle mt-0.5">{activeImage.note}</p>
                )}
              </div>
              <span className="text-ink-subtle tabular-nums shrink-0">
                {activeImage.category} · {activeImage.createdAt}
              </span>
            </div>
          )}

          {/* Thumbnails */}
          {filteredImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-hairline">
              {filteredImages.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    idx === selectedImageIdx
                      ? 'border-primary'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* RIGHT (4 cols): Detailed Tabs, Checkpoints & Episode Memo */}
        <aside className="lg:col-span-4 space-y-5">
          <section className="bg-white rounded-2xl border border-hairline overflow-hidden">
            <div className="flex border-b border-hairline overflow-x-auto no-scrollbar px-2 bg-surface-low/40">
              {[
                { id: 'appearance' as const, label: '외모' },
                { id: 'personality' as const, label: '성격' },
                { id: 'ability' as const, label: '능력·스탯' },
                { id: 'timeline' as const, label: '연표' },
                { id: 'secret' as const, label: '비밀' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDetailTab(t.id)}
                  className={`px-3.5 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    detailTab === t.id
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-ink-muted hover:text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {detailTab === 'appearance' && (
                <>
                  <div>
                    <h3 className="text-xs font-bold text-ink-subtle uppercase tracking-wider mb-1.5">
                      외모 및 인상 요약
                    </h3>
                    <p className="text-sm text-ink leading-relaxed">
                      {character.appearanceSummary}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-ink-subtle uppercase tracking-wider mb-1.5">
                      소개 및 서사 위치
                    </h3>
                    <p className="text-sm text-ink-muted leading-relaxed">
                      {character.shortBio}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-hairline">
                    <h3 className="text-xs font-bold text-ink-subtle mb-2">
                      키워드 태그
                    </h3>
                    <p className="text-xs text-primary font-medium leading-relaxed">
                      {character.tags.map((t) => `#${t}`).join('  ·  ')}
                    </p>
                  </div>
                </>
              )}

              {detailTab === 'personality' && (
                <>
                  <div>
                    <h3 className="text-xs font-bold text-ink-subtle mb-1.5">
                      성격 및 가치관
                    </h3>
                    <p className="text-sm text-ink leading-relaxed">
                      {character.personalitySummary}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-ink-subtle mb-1.5">
                      말투 특징
                    </h3>
                    <p className="text-sm text-ink-muted leading-relaxed">
                      {character.speechStyle}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-hairline text-xs">
                    <div>
                      <p className="font-bold text-primary mb-1">좋아하는 것</p>
                      <ul className="space-y-1 text-ink-muted">
                        {character.likes.map((item) => (
                          <li key={item}>· {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-bold text-danger mb-1">싫어하는 것</p>
                      <ul className="space-y-1 text-ink-muted">
                        {character.dislikes.map((item) => (
                          <li key={item}>· {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}

              {detailTab === 'ability' && (
                <>
                  <RadarChart
                    stats={character.radarStats}
                    accentColor={character.palette[0] || '#006194'}
                  />
                  <div className="pt-3 border-t border-hairline space-y-1.5">
                    <h3 className="text-xs font-bold text-primary">
                      고유 능력 · {character.abilityName}
                    </h3>
                    <p className="text-sm text-ink-muted leading-relaxed">
                      {character.abilitySummary}
                    </p>
                  </div>
                  {character.artifacts.length > 0 && (
                    <div className="pt-3 border-t border-hairline space-y-2">
                      <h3 className="text-xs font-bold text-ink">
                        아티팩트 · 소지품
                      </h3>
                      {character.artifacts.map((art) => (
                        <div
                          key={art.id}
                          className="p-3 rounded-xl bg-surface-low/70 border border-hairline"
                        >
                          <p className="text-xs font-bold text-ink">
                            {art.name}{' '}
                            <span className="font-normal text-ink-subtle">
                              · {art.kind}
                            </span>
                          </p>
                          <p className="text-xs text-ink-muted mt-1">
                            {art.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {detailTab === 'timeline' && (
                <div className="space-y-3">
                  {character.timeline.length === 0 ? (
                    <p className="text-xs text-ink-subtle py-4 text-center">
                      등록된 개인 연표 사건이 없습니다.
                    </p>
                  ) : (
                    character.timeline.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3.5 rounded-xl bg-surface-low/60 border border-hairline space-y-1"
                      >
                        <p className="text-[11px] font-semibold text-primary">
                          {ev.dateLabel} {ev.tag ? `· ${ev.tag}` : ''}
                        </p>
                        <p className="text-sm font-bold text-ink">{ev.title}</p>
                        <p className="text-xs text-ink-muted leading-relaxed">
                          {ev.summary}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {detailTab === 'secret' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-surface-low border border-hairline space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                      <Lock className="w-3.5 h-3.5 text-tertiary" />
                      <span>비공개 비밀 설정</span>
                    </div>
                    <p className="text-sm text-ink leading-relaxed">
                      {character.secretMemo ||
                        '아직 기록된 비밀 설정이 없습니다.'}
                    </p>
                  </div>

                  {character.storyFlags.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-ink">스토리 플래그</h3>
                      {character.storyFlags.map((flag) => (
                        <div
                          key={flag.id}
                          className="p-3 rounded-xl border border-hairline text-xs"
                        >
                          <p className="font-semibold text-ink">
                            {flag.label} ·{' '}
                            <span className="text-primary">
                              {flag.status === 'resolved'
                                ? '해소됨'
                                : flag.status === 'active'
                                  ? '복선 활성'
                                  : '대기 중'}
                            </span>
                          </p>
                          {flag.note && (
                            <p className="text-ink-muted mt-1">{flag.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Linked Checkpoints */}
          <section className="bg-white rounded-2xl border border-hairline p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">연결된 체크포인트</h2>
              <Link
                to="/checkpoints"
                className="text-xs font-medium text-primary hover:underline"
              >
                관리
              </Link>
            </div>
            {linkedCheckpoints.length === 0 ? (
              <p className="text-xs text-ink-subtle">
                이 캐릭터에 연결된 체크포인트가 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {linkedCheckpoints.map((cp) => (
                  <button
                    key={cp.id}
                    type="button"
                    onClick={() => toggleCheckpoint(cp.id)}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-low/60 hover:bg-surface-low text-left transition-colors"
                  >
                    {cp.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-ink-subtle shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-medium ${
                          cp.completed
                            ? 'line-through text-ink-subtle'
                            : 'text-ink'
                        }`}
                      >
                        {cp.title}
                      </p>
                      <p className="text-[11px] text-ink-subtle tabular-nums mt-0.5">
                        {cp.dDayLabel} · 진행률 {cp.progress}%
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Episode Memo */}
          <section className="bg-white rounded-2xl border border-hairline p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">에피소드 메모</h2>
              <button
                type="button"
                onClick={handleSaveMemo}
                className="text-xs font-semibold text-primary hover:underline"
              >
                메모 저장
              </button>
            </div>
            <textarea
              rows={4}
              value={memoDraft}
              onChange={(e) => setMemoDraft(e.target.value)}
              placeholder="장면 아이디어, 대사 초안, 연출 메모를 기록하세요..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-hairline bg-surface focus:outline-none focus:border-primary"
            />
          </section>
        </aside>
      </div>

      {/* Lightbox Zoom Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-ink/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/15 text-white hover:bg-white/25"
            aria-label="확대 닫기"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="아트워크 확대 보기"
            className="max-w-full max-h-[88vh] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <ImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        titleText={`${character.name} 새 이미지 등록`}
        onSubmit={(payload) => addCharacterImage(character.id, payload)}
      />

      <CharacterSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        character={character}
        allCharacters={state.characters}
        onSave={(updated) => {
          updateCharacter(character.id, () => updated);
          showToast(`${character.name}의 상세 설정이 저장되었습니다.`);
        }}
      />
    </div>
  );
};
