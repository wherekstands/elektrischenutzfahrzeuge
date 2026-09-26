/**
 * Vehicle illustrations shown when a listing has no photos (ported from the prototype's `illo()`).
 * Returns SVG markup so it can be inlined in HTML and embedded in generated OG images.
 */
import type { Illustration } from './constants'

const PAINT = ['#F4F6F9', '#FFFFFF', '#E6EAF0', '#DADFE7', '#EEF1F5']

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  let r = n >> 16
  let g = (n >> 8) & 255
  let b = n & 255
  const t = amt < 0 ? 0 : 255
  const p = Math.abs(amt)
  r = Math.round((t - r) * p + r)
  g = Math.round((t - g) * p + g)
  b = Math.round((t - b) * p + b)
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

type Options = {
  seed?: string
  label?: string
  /** 'css' uses theme variables (light/dark aware); 'static' uses fixed light colours (OG images). */
  palette?: 'css' | 'static'
  uid?: string
}

export function illustrationSvg(type: Illustration | null | undefined, opts: Options = {}): string {
  const kind = type ?? 'van'
  const u = (opts.uid ?? `il${hash((opts.seed ?? '') + kind).toString(36)}`).replace(/[^a-zA-Z0-9_-]/g, '')
  const col = PAINT[hash(opts.seed || kind) % PAINT.length]
  const dk = shade(col, -0.32)
  const lt = shade(col, 0.28)
  const S = `stroke="${dk}" stroke-width="2" stroke-linejoin="round"`
  const glass = `url(#${u}g)`
  const wheel = (x: number, r = 34) =>
    `<circle cx="${x}" cy="${336 - r}" r="${r}" fill="#171A20"/><circle cx="${x}" cy="${336 - r}" r="${r * 0.6}" fill="url(#${u}r)"/><circle cx="${x}" cy="${336 - r}" r="${r * 0.18}" fill="#5E6775"/>`
  const arch = (x: number, r = 34) => `<circle cx="${x}" cy="${336 - r}" r="${r + 7}" fill="${dk}" opacity=".35"/>`
  const bolt = (x: number, y: number, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><circle r="15" fill="${lt}" opacity=".9"/><path d="M2-9-6 2h5l-1 7 8-11H1z" fill="${dk}"/></g>`
  const head = (x: number, y: number) => `<rect x="${x}" y="${y}" width="12" height="9" rx="3" fill="#FFE39A"/>`
  const tail = (x: number, y: number, h = 26) => `<rect x="${x}" y="${y}" width="6" height="${h}" rx="2" fill="#E0573A"/>`

  let v = ''
  switch (kind) {
    case 'pickup':
      v = `<path d="M70 302V214H296V302Z" fill="${col}" ${S}/><rect x="66" y="206" width="232" height="11" rx="3" fill="${dk}"/>
        <path d="M290 302V198L318 152Q324 144 336 144H422Q434 144 442 152L490 212Q560 218 578 246V302Z" fill="${col}" ${S}/>
        <path d="M330 158H416L462 210H330Z" fill="${glass}"/><path d="M392 158V210" stroke="${col}" stroke-width="6"/>
        <rect x="60" y="232" width="520" height="6" fill="${dk}" opacity=".18"/>${arch(152)}${arch(482)}${wheel(152)}${wheel(482)}${head(566, 250)}${tail(70, 222, 22)}
        <rect x="560" y="288" width="24" height="14" rx="4" fill="#2A2F37"/>${bolt(230, 262, 0.9)}`
      break
    case 'truck':
      v = `<rect x="56" y="102" width="334" height="182" rx="8" fill="#F7F9FB" stroke="#AEB7C4" stroke-width="2"/>
        <path d="M70 118H376" stroke="#DCE1E8" stroke-width="2"/><rect x="56" y="282" width="524" height="14" fill="#2A2F37"/>
        <path d="M398 300V132Q398 110 420 110H506Q526 110 534 128L566 212Q580 222 580 246V300Z" fill="${col}" ${S}/>
        <path d="M420 128H500Q512 128 518 140L540 198H420Z" fill="${glass}"/><rect x="398" y="236" width="182" height="6" fill="${dk}" opacity=".2"/>
        <rect x="262" y="272" width="126" height="26" rx="5" fill="#3B4553"/><path d="M322 278l-6 8h5l-1 6 7-9h-5l1-5z" fill="#F2A93B"/>
        ${arch(128, 32)}${arch(214, 32)}${arch(506, 32)}${wheel(128, 32)}${wheel(214, 32)}${wheel(506, 32)}${head(568, 252)}${tail(56, 240)}`
      break
    case 'tractor':
      v = `<rect x="70" y="272" width="300" height="16" fill="#2A2F37"/><rect x="140" y="258" width="96" height="14" rx="5" fill="#59616E"/>
        <rect x="248" y="226" width="110" height="46" rx="6" fill="#3B4553"/><path d="M304 236l-7 10h6l-1 8 8-11h-6l1-7z" fill="#F2A93B"/>
        <path d="M366 70Q430 48 510 66V92H370Z" fill="${dk}"/>
        <path d="M360 300V112Q360 90 382 90H506Q526 90 534 110L568 204Q582 214 582 238V300Z" fill="${col}" ${S}/>
        <path d="M384 112H498Q510 112 516 124L542 192H384Z" fill="${glass}"/><rect x="360" y="232" width="222" height="6" fill="${dk}" opacity=".2"/>
        ${arch(160, 32)}${arch(236, 32)}${arch(508, 32)}${wheel(160, 32)}${wheel(236, 32)}${wheel(508, 32)}${head(570, 248)}`
      break
    case 'bus':
      v = `<rect x="150" y="100" width="300" height="20" rx="8" fill="${lt}" stroke="${dk}" stroke-width="1.5"/>
        <path d="M50 302V142Q50 118 74 118H560Q590 118 590 148V302Z" fill="${col}" ${S}/>
        <rect x="64" y="136" width="514" height="78" rx="10" fill="${glass}"/>
        ${[140, 216, 292, 368, 444].map((x) => `<rect x="${x}" y="136" width="7" height="78" fill="${col}"/>`).join('')}
        <rect x="104" y="146" width="54" height="150" rx="4" fill="${glass}" stroke="${col}" stroke-width="3"/><path d="M131 146V296" stroke="${col}" stroke-width="3"/>
        <rect x="392" y="146" width="54" height="150" rx="4" fill="${glass}" stroke="${col}" stroke-width="3"/><path d="M419 146V296" stroke="${col}" stroke-width="3"/>
        <rect x="518" y="122" width="58" height="10" rx="3" fill="#F2A93B" opacity=".9"/><rect x="50" y="238" width="540" height="6" fill="${dk}" opacity=".18"/>
        ${arch(200, 32)}${arch(510, 32)}${wheel(200, 32)}${wheel(510, 32)}${head(576, 262)}${tail(50, 230, 30)}${bolt(300, 266, 0.85)}`
      break
    case 'refuse':
      v = `<path d="M40 302V196Q40 172 62 172V302Z" fill="${dk}"/>
        <path d="M60 300V150Q60 104 110 104H420V300Z" fill="${col}" ${S}/>
        ${[130, 200, 270, 340].map((x) => `<path d="M${x} 116V290" stroke="${dk}" stroke-width="2" opacity=".35"/>`).join('')}
        <rect x="56" y="292" width="530" height="12" fill="#2A2F37"/>
        <path d="M428 300V148Q428 122 454 122H540Q566 122 572 148L586 250V300Z" fill="${lt}" ${S}/>
        <path d="M442 138H552Q562 138 564 150L574 238H442Z" fill="${glass}"/>
        ${arch(150, 32)}${arch(252, 32)}${arch(514, 32)}${wheel(150, 32)}${wheel(252, 32)}${wheel(514, 32)}${head(574, 256)}${bolt(240, 200, 1)}`
      break
    case 'bike':
      v = `<g stroke="#2A2F37" stroke-width="7" stroke-linecap="round" fill="none"><path d="M170 290L250 196H352L396 290"/><path d="M250 196L230 150"/><path d="M352 196L384 128"/><path d="M364 128H404"/><path d="M212 146H250"/></g>
        <rect x="392" y="200" width="168" height="84" rx="12" fill="${col}" ${S}/><rect x="404" y="212" width="144" height="10" rx="4" fill="${dk}" opacity=".3"/>${bolt(476, 254, 0.9)}
        <circle cx="170" cy="296" r="38" fill="none" stroke="#171A20" stroke-width="10"/><circle cx="476" cy="302" r="32" fill="none" stroke="#171A20" stroke-width="10"/>
        <circle cx="170" cy="296" r="4" fill="#5E6775"/><circle cx="476" cy="302" r="4" fill="#5E6775"/>`
      break
    case 'micro':
      v = `<g transform="translate(96 84) scale(.74)"><path d="M78 300V178Q78 142 114 142H400Q432 142 452 164L520 236Q572 244 580 272V300Z" fill="${col}" ${S}/>
        <path d="M416 164Q432 160 444 172L500 234H416Z" fill="${glass}"/><path d="M400 150V296" stroke="${dk}" stroke-width="2" opacity=".35"/>
        ${arch(170)}${arch(480)}${wheel(170)}${wheel(480)}${head(566, 252)}${bolt(260, 220, 1)}</g>`
      break
    case 'excavator':
      v = `<rect x="150" y="294" width="270" height="42" rx="21" fill="#2A2F37"/>${[178, 222, 266, 310, 354, 394].map((x) => `<circle cx="${x}" cy="315" r="8" fill="#59616E"/>`).join('')}
        <rect x="172" y="282" width="226" height="14" rx="4" fill="#3B4553"/>
        <path d="M150 284V214Q150 198 166 198H262V284Z" fill="${col}" ${S}/>
        <path d="M242 284V140Q242 126 256 126H312Q326 126 330 140L342 210V284Z" fill="${col}" ${S}/><path d="M256 142H312L326 206H256Z" fill="${glass}"/>
        <path d="M330 226L434 128L516 212" stroke="${dk}" stroke-width="30" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M330 226L434 128L516 212" stroke="${col}" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M352 238L414 166" stroke="#C9CFD6" stroke-width="7" stroke-linecap="round"/>
        <path d="M498 206L552 218L544 266Q522 276 500 252Z" fill="#3B4553"/>${bolt(206, 240, 0.85)}`
      break
    case 'loader':
      v = `<path d="M86 290V214Q86 196 104 196H246V290Z" fill="${col}" ${S}/>
        <path d="M196 290V120Q196 106 210 106H290Q304 106 306 120L316 214V290Z" fill="${col}" ${S}/><path d="M210 122H288L298 206H210Z" fill="${glass}"/>
        <rect x="300" y="238" width="110" height="36" rx="6" fill="${dk}"/>
        <path d="M318 232L444 196L498 262" stroke="${dk}" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M466 232H568L558 312Q516 322 466 306Z" fill="#3B4553"/>
        ${wheel(158, 46)}${wheel(398, 46)}${bolt(140, 236, 0.85)}`
      break
    case 'telehandler':
      v = `<path d="M70 300V246Q70 230 86 230H520Q538 230 542 248V300Z" fill="${col}" ${S}/>
        <path d="M148 256V140Q148 126 162 126H222Q236 126 238 140L246 230V256Z" fill="${col}" ${S}/><path d="M162 142H220L230 222H162Z" fill="${glass}"/>
        <path d="M110 214L560 128" stroke="${dk}" stroke-width="30" stroke-linecap="round"/><path d="M110 214L560 128" stroke="${col}" stroke-width="24" stroke-linecap="round"/>
        <path d="M552 124V244H628V256H540V124Z" fill="#3B4553"/>
        ${arch(150, 38)}${arch(470, 38)}${wheel(150, 38)}${wheel(470, 38)}${bolt(380, 262, 0.8)}`
      break
    case 'dumper':
      v = `<path d="M104 300V238H300V300Z" fill="${dk}"/><rect x="130" y="206" width="54" height="34" rx="6" fill="#2A2F37"/>
        <path d="M150 238V146H226V238" stroke="#2A2F37" stroke-width="8" fill="none" stroke-linejoin="round"/>
        <path d="M296 260L330 164H548L566 260Q432 286 296 260Z" fill="${col}" ${S}/><path d="M340 184H536" stroke="${dk}" stroke-width="2" opacity=".35"/>
        ${arch(186, 40)}${arch(470, 40)}${wheel(186, 40)}${wheel(470, 40)}${bolt(440, 220, 0.9)}`
      break
    case 'roller':
      v = `<rect x="90" y="252" width="150" height="84" rx="42" fill="${dk}"/><rect x="104" y="266" width="122" height="56" rx="28" fill="#59616E"/>
        <rect x="400" y="252" width="150" height="84" rx="42" fill="${dk}"/><rect x="414" y="266" width="122" height="56" rx="28" fill="#59616E"/>
        <path d="M150 256V214Q150 196 168 196H472Q490 196 490 214V256Z" fill="${col}" ${S}/>
        <path d="M252 196V112Q252 98 266 98H374Q388 98 390 112L396 196Z" fill="${col}" ${S}/><path d="M266 114H372L378 188H266Z" fill="${glass}"/>
        <rect x="300" y="86" width="22" height="12" rx="3" fill="#F2A93B"/>${bolt(200, 226, 0.85)}`
      break
    case 'platform':
      v = `<path d="M110 300V252Q110 236 126 236H514Q530 236 530 252V300Z" fill="${col}" ${S}/>
        <g stroke="#3B4553" stroke-width="10" stroke-linecap="round"><path d="M170 236L470 150"/><path d="M170 150L470 236"/><path d="M170 150L470 64"/><path d="M170 64L470 150"/></g>
        <rect x="140" y="40" width="360" height="26" rx="4" fill="${col}" ${S}/><path d="M150 40V10H490V40" stroke="#F2A93B" stroke-width="6" fill="none"/>
        ${wheel(170, 32)}${wheel(470, 32)}${bolt(320, 270, 0.85)}`
      break
    case 'agtractor':
      v = `<rect x="148" y="80" width="176" height="12" rx="4" fill="${dk}"/>
        <path d="M298 270V202Q298 188 312 188H516Q538 188 548 208L566 252V270Z" fill="${col}" ${S}/>
        <path d="M160 270V104Q160 92 172 92H296Q308 92 310 104L316 196V270Z" fill="${col}" ${S}/><path d="M174 108H294L302 190H174Z" fill="${glass}"/>
        <path d="M122 232Q140 160 212 158Q286 160 304 232" fill="none" stroke="${dk}" stroke-width="12" stroke-linecap="round"/>
        <rect x="560" y="236" width="26" height="30" rx="4" fill="#3B4553"/>
        <circle cx="212" cy="264" r="72" fill="#171A20"/><circle cx="212" cy="264" r="40" fill="url(#${u}r)"/><circle cx="212" cy="264" r="12" fill="#5E6775"/>
        ${wheel(490, 42)}${bolt(430, 230, 0.85)}`
      break
    case 'mower':
      v = `<rect x="150" y="288" width="340" height="48" rx="24" fill="#2A2F37"/>${[180, 230, 280, 330, 380, 430, 462].map((x) => `<circle cx="${x}" cy="312" r="9" fill="#59616E"/>`).join('')}
        <path d="M176 288V236Q176 218 194 218H446Q464 218 464 236V288Z" fill="${col}" ${S}/>
        <rect x="200" y="232" width="120" height="10" rx="4" fill="${dk}" opacity=".35"/>
        <path d="M430 218V172" stroke="#2A2F37" stroke-width="4"/><circle cx="430" cy="168" r="6" fill="#E0573A"/>
        ${[80, 110, 520, 560, 590].map((x) => `<path d="M${x} 336q6-22 10 0q4-18 8 0" fill="#6FAE5B"/>`).join('')}${bolt(320, 262, 0.9)}`
      break
    case 'sweeper':
      v = `<path d="M80 290V150Q80 122 108 122H330V290Z" fill="${col}" ${S}/><path d="M100 150H310" stroke="${dk}" stroke-width="2" opacity=".35"/>
        <path d="M330 290V118Q330 102 346 102H452Q470 102 478 120L500 230V290Z" fill="${lt}" ${S}/>
        <path d="M346 118H450Q458 118 462 130L482 222H346Z" fill="${glass}"/><rect x="390" y="90" width="22" height="12" rx="3" fill="#F2A93B"/>
        <ellipse cx="520" cy="324" rx="40" ry="11" fill="#F2A93B"/><ellipse cx="440" cy="330" rx="34" ry="8" fill="#F2A93B" opacity=".8"/>
        ${arch(160, 30)}${arch(412, 30)}${wheel(160, 30)}${wheel(412, 30)}${bolt(200, 210, 1)}`
      break
    case 'carrier':
      v = `<rect x="70" y="172" width="270" height="56" rx="4" fill="${col}" ${S}/><rect x="70" y="226" width="270" height="14" fill="${dk}"/>
        <rect x="70" y="238" width="430" height="48" rx="6" fill="${dk}" opacity=".85"/>
        <path d="M340 286V132Q340 116 356 116H440Q458 116 464 132L488 222V286Z" fill="${col}" ${S}/><path d="M356 132H438L458 214H356Z" fill="${glass}"/>
        <path d="M500 244Q548 244 566 306H500Z" fill="#F2A93B"/><rect x="420" y="104" width="22" height="12" rx="3" fill="#F2A93B"/>
        ${wheel(150)}${wheel(420)}${bolt(205, 200, 0.9)}`
      break
    case 'forklift':
      v = `<path d="M108 300V222Q108 202 128 202H152V300Z" fill="${dk}"/>
        <path d="M140 300V202Q140 186 156 186H362V300Z" fill="${col}" ${S}/>
        <path d="M200 186V98H352V186M190 98H362" stroke="#2A2F37" stroke-width="8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
        <rect x="236" y="150" width="40" height="36" rx="6" fill="#2A2F37"/>
        <rect x="372" y="56" width="14" height="270" fill="#3B4553"/><rect x="394" y="56" width="14" height="270" fill="#3B4553"/>
        <rect x="404" y="216" width="22" height="94" fill="#2A2F37"/><path d="M404 298H536V310H404Z" fill="#2A2F37"/>
        <rect x="430" y="226" width="100" height="70" rx="3" fill="#D6B07A"/><path d="M430 262H530M480 226V296" stroke="#B48A55" stroke-width="3"/>
        ${wheel(196, 30)}${wheel(338, 32)}${bolt(250, 244, 0.85)}`
      break
    case 'yard':
      v = `<rect x="90" y="266" width="480" height="22" rx="4" fill="#2A2F37"/>
        <path d="M100 262H334L360 270H92Z" fill="#59616E"/><rect x="190" y="222" width="130" height="44" rx="6" fill="#3B4553"/>
        <path d="M252 232l-7 10h6l-1 8 8-11h-6l1-7z" fill="#F2A93B"/>
        <path d="M398 288V118Q398 102 414 102H538Q556 102 560 118L568 288Z" fill="${col}" ${S}/><path d="M414 120H538L546 212H414Z" fill="${glass}"/>
        <rect x="450" y="92" width="22" height="10" rx="3" fill="#F2A93B"/>
        ${arch(170, 32)}${arch(250, 32)}${arch(492, 32)}${wheel(170, 32)}${wheel(250, 32)}${wheel(492, 32)}`
      break
    case 'tug':
      v = `<path d="M108 300V238Q108 214 132 214H456Q498 214 520 242L542 300Z" fill="${col}" ${S}/>
        <path d="M200 214V122H342V214" stroke="#2A2F37" stroke-width="8" fill="none" stroke-linejoin="round"/><rect x="188" y="112" width="166" height="14" rx="4" fill="${dk}"/>
        <rect x="236" y="178" width="46" height="36" rx="8" fill="#2A2F37"/><rect x="84" y="268" width="28" height="12" rx="3" fill="#2A2F37"/>
        <rect x="300" y="102" width="20" height="10" rx="3" fill="#F2A93B"/><rect x="108" y="250" width="434" height="6" fill="${dk}" opacity=".2"/>
        ${arch(182)}${arch(452)}${wheel(182)}${wheel(452)}${bolt(400, 256, 0.85)}`
      break
    case 'utv':
      v = `<rect x="80" y="220" width="170" height="44" rx="4" fill="${col}" ${S}/>
        <path d="M356 266V226L420 210Q486 212 524 250V266Z" fill="${col}" ${S}/><rect x="76" y="258" width="452" height="18" rx="4" fill="${dk}"/>
        <path d="M250 222V118H384L424 212" stroke="#2A2F37" stroke-width="8" fill="none" stroke-linejoin="round"/><rect x="240" y="110" width="152" height="12" rx="4" fill="${dk}"/>
        <rect x="270" y="186" width="44" height="34" rx="8" fill="#2A2F37"/>
        <circle cx="160" cy="298" r="38" fill="#171A20" stroke="#2A2F37" stroke-width="6" stroke-dasharray="6 5"/><circle cx="160" cy="298" r="20" fill="url(#${u}r)"/>
        <circle cx="462" cy="298" r="38" fill="#171A20" stroke="#2A2F37" stroke-width="6" stroke-dasharray="6 5"/><circle cx="462" cy="298" r="20" fill="url(#${u}r)"/>${bolt(166, 240, 0.8)}`
      break
    default:
      v = `<path d="M78 302V178Q78 142 114 142H400Q432 142 452 164L520 236Q572 244 580 272V302Z" fill="${col}" ${S}/>
        <path d="M416 164Q432 160 444 172L500 234H416Z" fill="${glass}"/>
        <path d="M400 150V298M250 146V298" stroke="${dk}" stroke-width="2" opacity=".32"/><rect x="264" y="220" width="20" height="5" rx="2" fill="${dk}" opacity=".5"/>
        <rect x="78" y="252" width="502" height="6" fill="${dk}" opacity=".16"/>
        ${arch(170)}${arch(480)}${wheel(170)}${wheel(480)}${head(566, 254)}${tail(78, 196, 30)}
        <rect x="558" y="288" width="26" height="14" rx="4" fill="#2A2F37"/>${bolt(330, 208, 0.9)}`
  }

  const css = opts.palette !== 'static'
  const stop = (cssVar: string, fallback: string) => (css ? `style="stop-color:var(${cssVar})"` : `stop-color="${fallback}"`)
  const floor = css ? `style="fill:var(--illo-floor)"` : `fill="#E6EAF1"`
  const label = esc(opts.label ?? `Illustration of a ${kind}`)
  return `<svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" ${stop('--illo-a', '#EDF1F7')}/><stop offset="1" ${stop('--illo-b', '#F8FAFC')}/></linearGradient>
    <linearGradient id="${u}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" ${stop('--illo-glass-b', '#5E7391')}/><stop offset=".55" ${stop('--illo-glass-a', '#2E3E55')}/><stop offset="1" ${stop('--illo-glass-b', '#5E7391')}/></linearGradient>
    <radialGradient id="${u}r"><stop offset="0" stop-color="#E4E8ED"/><stop offset="1" stop-color="#9AA3AF"/></radialGradient>
    <radialGradient id="${u}s"><stop offset="0" stop-color="#0D1421" stop-opacity=".28"/><stop offset="1" stop-color="#0D1421" stop-opacity="0"/></radialGradient></defs>
    <rect width="640" height="400" fill="url(#${u}b)"/><rect y="336" width="640" height="64" ${floor}/>
    <ellipse cx="320" cy="338" rx="300" ry="16" fill="url(#${u}s)"/>${v.replace(/\s*\n\s*/g, '')}</svg>`
}
