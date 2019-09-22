/**
 * Generates uuid.
 */
export function uuid () {
  let uuid = ''
  let i
  let random
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0

    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-'
    }
    uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16)
  }
  return uuid
}

export function cleanText (text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

const stopPatterns = {
  ja: [
    /[。．！？：][）)」\]』］】"'”’]/g,
    /\b(Mr|Mrs|Ms|[Nn]o|[Ff]igs?)\.\s+/g,
    /[.!?:][)\]"'”’]/g,
    /\be\.g\.\s+/g,
    /\b[Ee]tc\.\s+/g,
    /\bJan\.\s+/g,
    /\bFeb\.\s+/g,
    /\bMar\.\s+/g,
    /\bApr\.\s+/g,
    /\bJun\.\s+/g,
    /\bJul\.\s+/g,
    /\bAug\.\s+/g,
    /\bSept?\.\s+/g,
    /\bOct\.\s+/g,
    /\bNov\.\s+/g,
    /\bDec\.\s+/g,
    /\bPh\.?D\.\s/
  ],
  en: [
    /\b(Mr|Mrs|Ms|[Nn]o|[Ff]igs?)\.\s+/g,
    /[.!?:][)\]"'”’]/g,
    /\be\.g\.\s+/g,
    /\b[Ee]tc\.\s+/g,
    /\bJan\.\s+/g,
    /\bFeb\.\s+/g,
    /\bMar\.\s+/g,
    /\bApr\.\s+/g,
    /\bJun\.\s+/g,
    /\bJul\.\s+/g,
    /\bAug\.\s+/g,
    /\bSept?\.\s+/g,
    /\bOct\.\s+/g,
    /\bNov\.\s+/g,
    /\bDec\.\s+/g,
    /\bPh\.?D\.\s/
  ]
}

const breakPatterns = {
  ja: [
    /[。．！？：]\s*/g,
    /\n/g
  ],
  en: [
    /[.?!:]\s+/g,
    /\n/g
  ]
}

/**
 * Breaks srcText into sentences.
 * @param {string} srcText - Source text
 * @param {String} lang - language code ("ja" or "en")
 */
export function breakIntoSentences (srcText, lang) {
  const sentences = []
  let breakPoints = []
  let nonBreakPoints = []
  srcText = cleanText(srcText)
  // Get all break points.
  for (const pattern of (breakPatterns[lang] || breakPatterns['en'])) {
    let result
    while ((result = pattern.exec(srcText)) != null) {
      console.log(result)
      breakPoints.push(pattern.lastIndex)
    }
  }
  breakPoints = Array.from(new Set(breakPoints))
  breakPoints.sort((a, b) => { return a - b })
  console.log('breakPoints:', breakPoints)

  // Get all non-break points
  for (const pattern of (stopPatterns[lang] || stopPatterns['en'])) {
    let result
    while ((result = pattern.exec(srcText)) != null) {
      // console.log(result)
      nonBreakPoints.push([result.index, pattern.lastIndex])
    }
  }
  console.log('nonBreakPoints', nonBreakPoints)
  let start = 0
  for (const p of breakPoints) {
    if (nonBreakPoints.some(x => p > x[0] && p <= x[1])) {
      continue
    }
    const sents = srcText.substring(start, p).trim().split(/\n/)
    sentences.push(...sents)
    start = p
  }
  if (start < srcText.length) {
    const sents = srcText.substr(start).trim().split(/\n/)
    sentences.push(...sents)
  }

  return sentences
}
