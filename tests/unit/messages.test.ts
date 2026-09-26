import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { createTranslator } from 'next-intl'
import { describe, expect, it } from 'vitest'

type Tree = { [key: string]: string | Tree }

const dir = path.resolve(__dirname, '../../messages')
const load = (file: string) => JSON.parse(readFileSync(path.join(dir, file), 'utf8')) as Tree
const en = load('en.json')
const others = readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'en.json')

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') out[key] = v
    else Object.assign(out, flatten(v, key))
  }
  return out
}

/** Top-level ICU argument names, e.g. {count}, {count, plural, …} → count. */
const placeholders = (msg: string) =>
  [...new Set([...msg.matchAll(/\{\s*([a-zA-Z_]\w*)\s*[,}]/g)].map((m) => m[1]))].sort()

describe('messages', () => {
  it('has at least one other locale', () => {
    expect(others.length).toBeGreaterThan(0)
  })

  for (const file of others) {
    describe(file, () => {
      const flat = flatten(load(file))
      const base = flatten(en)

      it('has exactly the English keys', () => {
        expect(Object.keys(flat).sort()).toEqual(Object.keys(base).sort())
      })

      it('uses the same placeholders as English', () => {
        const mismatches = Object.keys(base)
          .filter((k) => k in flat && placeholders(flat[k]).join() !== placeholders(base[k]).join())
          .map((k) => `${k}: ${placeholders(base[k])} vs ${placeholders(flat[k])}`)
        expect(mismatches).toEqual([])
      })

      it('every message formats', () => {
        const locale = file.replace('.json', '')
        const t = createTranslator({
          locale,
          messages: load(file),
          onError: (error) => {
            throw error
          },
        })
        const values = { count: 2, total: 3, filled: 1, index: 1, from: 1, to: 2, page: 1, year: 2026, groups: 2, areas: 2, types: 2, brands: 2, listings: 2, jobs: 2 }
        for (const key of Object.keys(flat)) {
          const args = Object.fromEntries(placeholders(flat[key]).map((p) => [p, p in values ? values[p as keyof typeof values] : 'x']))
          expect(() => t(key as never, args as never), key).not.toThrow()
        }
      })
    })
  }
})
