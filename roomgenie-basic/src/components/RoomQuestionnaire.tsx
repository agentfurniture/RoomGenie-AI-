'use client'
import { useState } from 'react'

const QUESTIONS = [
  { id: 'mood', label: 'What mood do you want?', options: ['Cozy & Warm', 'Clean & Fresh', 'Bold & Dramatic', 'Calm & Zen', 'Playful & Fun'] },
  { id: 'budget', label: 'Budget range?', options: ['Under $1K', '$1K–$5K', '$5K–$15K', '$15K–$50K', '$50K+'] },
  { id: 'lighting', label: 'Natural lighting?', options: ['Very bright', 'Moderate', 'Low light', 'No windows'] },
  { id: 'occupants', label: 'Who lives here?', options: ['Just me', 'Couple', 'Family with kids', 'Pets too', 'Roommates'] },
  { id: 'storage', label: 'Storage needs?', options: ['Minimal', 'Moderate', 'Lots of storage', 'Hidden storage'] },
  { id: 'material', label: 'Preferred materials?', options: ['Wood & Natural', 'Marble & Stone', 'Metal & Glass', 'Fabric & Soft', 'Mixed'] },
  { id: 'density', label: 'Furniture density?', options: ['Very minimal', 'Balanced', 'Fully furnished', 'Cozy & packed'] },
]

export interface QuestionnaireAnswers {
  [key: string]: string
}

interface RoomQuestionnaireProps {
  answers: QuestionnaireAnswers
  onChange: (answers: QuestionnaireAnswers) => void
  collapsed?: boolean
}

export default function RoomQuestionnaire({ answers, onChange, collapsed }: RoomQuestionnaireProps) {
  const [expanded, setExpanded] = useState(!collapsed)

  return (
    <div style={{ border: '1px solid #e8eaf0', borderRadius: 16, overflow: 'hidden', background: 'white' }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '16px 20px', background: expanded ? '#f8faff' : 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: expanded ? '1px solid #e8eaf0' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4f7cff,#7c3aed)', color: 'white', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>AI Design Questionnaire</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Help AI understand your preferences ({Object.keys(answers).length}/{QUESTIONS.length} answered)</p>
          </div>
        </div>
        <span style={{ fontSize: 18, color: '#94a3b8', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>⌄</span>
      </button>

      {expanded && (
        <div style={{ padding: '20px 20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {QUESTIONS.map(q => (
              <div key={q.id}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>{q.label}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {q.options.map(opt => (
                    <button key={opt} onClick={() => onChange({ ...answers, [q.id]: opt })} style={{
                      padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      border: `1.5px solid ${answers[q.id] === opt ? '#4f7cff' : '#e2e8f0'}`,
                      background: answers[q.id] === opt ? '#f0f4ff' : 'white',
                      color: answers[q.id] === opt ? '#4f7cff' : '#64748b',
                      transition: 'all 0.15s',
                    }}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

