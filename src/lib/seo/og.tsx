import 'server-only'

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

import type { Illustration } from '../constants'
import { SITE_NAME } from '../env'
import { illustrationSvg } from '../illustrations'

export const OG_SIZE = { width: 1200, height: 630 }

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 600 | 700; style: 'normal' }[]> | null = null
function loadFonts() {
  if (!fonts) {
    const dir = join(process.cwd(), 'src/assets/fonts')
    fonts = Promise.all([
      readFile(join(dir, 'og-BricolageGrotesque-Bold.woff')).then((data) => ({ name: 'Bricolage', data, weight: 700 as const, style: 'normal' as const })),
      readFile(join(dir, 'og-Geist-Regular.ttf')).then((data) => ({ name: 'Geist', data, weight: 400 as const, style: 'normal' as const })),
      readFile(join(dir, 'og-Geist-SemiBold.ttf')).then((data) => ({ name: 'Geist', data, weight: 600 as const, style: 'normal' as const })),
      readFile(join(dir, 'og-GeistMono-Medium.ttf')).then((data) => ({ name: 'GeistMono', data, weight: 600 as const, style: 'normal' as const })),
    ])
  }
  return fonts
}

export type OgInput = {
  eyebrow: string
  title: string
  subtitle?: string | null
  figures?: { label: string; value: string; unit?: string }[]
  illustration?: Illustration | null
  photoUrl?: string | null
  badge?: string | null
}

/** Shared OG image layout: text left, photo or illustration right, key figures along the bottom. */
export async function renderOgImage(input: OgInput): Promise<ImageResponse> {
  const svg = illustrationSvg(input.illustration ?? 'van', { palette: 'static', seed: input.title, uid: 'og' })
  const art = input.photoUrl ?? `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
  const figures = (input.figures ?? []).slice(0, 3)
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#F6F7F9', fontFamily: 'Geist', color: '#0D1421' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 640, padding: '56px 0 52px 64px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#2552C4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="26" height="26" viewBox="0 0 32 32">
                  <path d="M18.5 5 9 18h6l-1.5 9L23 14h-6l1.5-9Z" fill="#fff" />
                </svg>
              </div>
              <div style={{ fontSize: 26, fontFamily: 'Bricolage' }}>{SITE_NAME}</div>
            </div>
            <div style={{ marginTop: 44, fontSize: 22, fontWeight: 600, letterSpacing: 2, color: '#5A6474', textTransform: 'uppercase' }}>{input.eyebrow}</div>
            <div style={{ marginTop: 10, fontSize: input.title.length > 28 ? 54 : 64, lineHeight: 1.04, fontFamily: 'Bricolage', letterSpacing: -1 }}>{input.title}</div>
            {input.subtitle && <div style={{ marginTop: 16, fontSize: 25, color: '#2A3342', lineHeight: 1.3 }}>{input.subtitle}</div>}
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            {figures.map((f) => (
              <div key={f.label} style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1px solid #E4E7EC', borderRadius: 16, padding: '14px 18px', minWidth: 150 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontFamily: 'GeistMono', fontSize: 34 }}>{f.value}</span>
                  {f.unit && <span style={{ fontSize: 18, color: '#5A6474' }}>{f.unit}</span>}
                </div>
                <div style={{ fontSize: 17, color: '#5A6474' }}>{f.label}</div>
              </div>
            ))}
            {!figures.length && input.badge && <div style={{ fontSize: 22, color: '#0B8A60' }}>{input.badge}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: 36 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art} alt="" width={500} height={375} style={{ borderRadius: 24, objectFit: 'cover', border: '1px solid #E4E7EC' }} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await loadFonts() },
  )
}
