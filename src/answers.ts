import { examName, partNumber, questionNumber, sumMarks, type Exam } from './model'

const entities: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' }
export const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
export function plainText(html: string) {
  return html
    .replace(/<span[^>]*data-equation="([^"]*)"[^>]*><\/span>/g, (_, latex: string) => ' ' + latex + ' ')
    .replace(/<\/(p|div|li|tr)>|<br\s*\/?>/g, '\n')
    .replace(/<\/t[dh]>/g, ' | ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(amp|lt|gt|quot|nbsp|#39);/g, match => entities[match] ?? match)
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
const lines = (value: string) => escapeHtml(value).replace(/\n/g, '<br>')
export function answerKeyHtml(exam: Exam) {
  const items = exam.questions.map((question, index) => {
    const parts = question.parts.map((part, i) => `<li><b>${escapeHtml(partNumber(i, exam.paper.parts))})</b> ${lines(plainText(part.content))}</li>`).join('')
    const answer = (question.answer ?? '').trim()
    return `<section><h2>${escapeHtml(questionNumber(index, exam.paper.numbering))}${question.marks ? ` <small>(${question.marks} درجة)</small>` : ''}</h2>`
      + `<p class="q">${lines(plainText(question.content)) || '—'}</p>${parts ? `<ul>${parts}</ul>` : ''}`
      + `<div class="a"><b>الإجابة النموذجية:</b><br>${answer ? lines(answer) : '<i>لم تُكتب إجابة لهذا السؤال.</i>'}</div></section>`
  }).join('')
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>مفتاح إجابات — ${escapeHtml(examName(exam))}</title>`
    + `<style>body{font-family:Amiri,Cairo,serif;max-width:800px;margin:24px auto;padding:0 16px;line-height:1.8}h1{border-bottom:2px solid #142544;padding-bottom:8px}`
    + `section{border:1px solid #cfd6e2;border-radius:8px;padding:10px 14px;margin:12px 0;break-inside:avoid}h2{margin:0 0 6px;font-size:1.1em}.q{margin:0 0 8px}.a{background:#f1f5fb;border-radius:6px;padding:8px 10px}@media print{body{margin:0}}</style></head>`
    + `<body><h1>مفتاح الإجابات — ${escapeHtml(examName(exam))}</h1><p>مجموع الدرجات: ${sumMarks(exam)}${exam.info.total !== null ? ' / ' + exam.info.total : ''}</p>${items || '<p>لا توجد أسئلة.</p>'}</body></html>`
}
