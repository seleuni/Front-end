import React, { useState } from 'react';
import type { Character } from '../types/archive';

interface CharacterAvatarProps {
  character: Pick<
    Character,
    'name' | 'englishName' | 'avatarUrl' | 'avatarGradient' | 'palette' | 'universeName'
  >;
  className?: string;
  objectPosition?: string;
  variant?: 'portrait' | 'square' | 'circle';
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  className = '',
  objectPosition = 'object-top',
  variant = 'portrait',
}) => {
  const [imgError, setImgError] = useState(false);

  const shapeClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'square'
        ? 'rounded-xl'
        : 'rounded-2xl';

  if (character.avatarUrl && !imgError) {
    return (
      <div
        className={`relative overflow-hidden bg-surface-low ${shapeClass} ${className}`}
      >
        <img
          src={character.avatarUrl}
          alt={`${character.name} 캐릭터 아트워크`}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover ${objectPosition} transition-transform duration-500`}
        />
      </div>
    );
  }

  const primaryHex = character.palette?.[0] || '#006194';
  const secondaryHex = character.palette?.[1] || '#7DB9DE';
  const initial = character.name.slice(0, 1);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${
        character.avatarGradient || 'from-sky-100 via-blue-50 to-indigo-100'
      } flex flex-col items-center justify-center select-none ${shapeClass} ${className}`}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        viewBox="0 0 200 260"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <circle cx="155" cy="45" r="56" fill={secondaryHex} />
        <circle cx="35" cy="215" r="72" fill={primaryHex} opacity="0.35" />
        <path
          d="M0 185 Q 90 140 200 190 L 200 260 L 0 260 Z"
          fill={primaryHex}
          opacity="0.18"
        />
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center px-3 text-center">
        <span
          className="font-display font-bold tracking-tight leading-none"
          style={{
            color: primaryHex,
            fontSize: variant === 'circle' ? '1.15rem' : '2.25rem',
          }}
        >
          {initial}
        </span>
        {variant !== 'circle' && (
          <span className="mt-2 text-[11px] font-medium tracking-wider uppercase text-ink-muted/80">
            {character.englishName}
          </span>
        )}
      </div>
    </div>
  );
};
