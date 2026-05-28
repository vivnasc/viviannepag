'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

// ─── Pill: status badge ────────────────────────────────────

export type PillVariant = 'pendente' | 'em-curso' | 'feito' | 'skip' | 'erro' | 'info' | 'aviso';

const PILL_VARIANTS: Record<PillVariant, string> = {
  pendente: 'bg-ocre/10 text-ocre/60 border-ocre/15',
  'em-curso': 'bg-lila/15 text-lila border-lila/25 animate-pulse',
  feito: 'bg-ambar/20 text-ambar border-ambar/30',
  skip: 'bg-creme-2/15 text-creme-2/60 border-creme-2/20',
  erro: 'bg-rosa/15 text-rosa border-rosa/25',
  info: 'bg-creme-2/10 text-creme-2/70 border-creme-2/15',
  aviso: 'bg-ambar/10 text-ambar/80 border-ambar/20',
};

export function Pill({ variant, children, className = '' }: {
  variant: PillVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center text-[0.6rem] px-2 py-0.5 rounded-full border ${PILL_VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── ProgressBar: two-phase (ouro / ouro-folha) ──────────

export function ProgressBar({ current, total, label, variant = 'ouro', subLabel }: {
  current: number;
  total: number;
  label: string;
  variant?: 'ouro' | 'ouro-folha';
  subLabel?: string;
}) {
  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const color = variant === 'ouro-folha' ? 'bg-ambar' : 'bg-ocre';
  return (
    <div>
      <div className="flex items-center justify-between text-[0.65rem] mb-1.5">
        <span className="text-creme-2/60 tracking-[0.04em]">{label}</span>
        <span className="text-creme-2/80">{current} / {total}</span>
      </div>
      <div className="h-1.5 rounded-full bg-terra-2/40 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {subLabel && (
        <p className="text-[0.6rem] text-creme-2/40 mt-1">{subLabel}</p>
      )}
    </div>
  );
}

// ─── Card: bordered surface ────────────────────────────────

export function Card({ children, className = '', elevado = false }: {
  children: ReactNode;
  className?: string;
  elevado?: boolean;
}) {
  return (
    <div className={`rounded-[14px] border ${elevado ? 'border-ocre/25 bg-terra-2/30' : 'border-ocre/15 bg-terra-2/20'} p-5 ${className}`}>
      {children}
    </div>
  );
}

// ─── Btn: 3 variants ──────────────────────────────────────

export type BtnVariant = 'default' | 'primary' | 'danger' | 'ghost';

const BTN_VARIANTS: Record<BtnVariant, string> = {
  default: 'border-ocre/30 text-creme-2/80 hover:border-ambar hover:text-ambar',
  primary: 'border-ambar/50 text-ambar bg-ambar/10 hover:bg-ambar/20',
  danger: 'border-rosa/40 text-rosa bg-rosa/5 hover:bg-rosa/15',
  ghost: 'border-transparent text-creme-2/50 hover:text-creme-2/80',
};

export function Btn({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}: {
  variant?: BtnVariant;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizes = {
    sm: 'text-[0.62rem] px-2 py-1 rounded-md',
    md: 'text-[0.7rem] px-3 py-1.5 rounded-[10px]',
    lg: 'text-[0.78rem] px-4 py-2.5 rounded-[12px]',
  };
  return (
    <button
      {...props}
      className={`border tracking-[0.04em] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${BTN_VARIANTS[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

// ─── EstimateCard: pre-execution cost preview ──────────────

export function EstimateCard({ items, assets, custoUsd, minutos, nota }: {
  items: number;
  assets: number;
  custoUsd: number | string;
  minutos: number;
  nota?: string;
}) {
  return (
    <div className="rounded-[12px] border border-ambar/25 bg-ambar/5 p-4 mb-3">
      <p className="text-[0.6rem] tracking-[0.2em] uppercase text-ambar/70 mb-2">Estimativa</p>
      <p className="font-serif text-creme text-[1.05rem]">
        <span className="text-ambar">{items}</span> {items === 1 ? 'item' : 'items'} &middot;{' '}
        <span className="text-ambar">{assets}</span> {assets === 1 ? 'imagem' : 'imagens'} &middot;{' '}
        <span className="text-ambar">~${typeof custoUsd === 'number' ? custoUsd.toFixed(2) : custoUsd}</span> &middot;{' '}
        <span className="text-ambar">~{minutos} min</span>
      </p>
      {nota && <p className="text-[0.65rem] text-creme-2/50 italic mt-2">{nota}</p>}
    </div>
  );
}
