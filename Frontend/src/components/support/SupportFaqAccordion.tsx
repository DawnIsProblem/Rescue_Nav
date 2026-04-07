import { useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

interface SupportFaqAccordionProps {
  items: FaqItem[]
  className?: string
  initialOpenIndex?: number | null
}

export default function SupportFaqAccordion({
  items,
  className,
  initialOpenIndex = null,
}: SupportFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex)

  return (
    <div className={className}>
      {items.map((item, index) => {
        const isOpen = openIndex === index

        return (
          <article
            key={item.question}
            className="border-b border-zinc-200 bg-white"
          >
            <button
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              type="button"
            >
              <span className="text-sm font-semibold text-zinc-700">{item.question}</span>
              <span className="text-zinc-400">{isOpen ? '-' : '+'}</span>
            </button>
            {isOpen ? <p className="px-4 pb-4 text-sm text-zinc-500">{item.answer}</p> : null}
          </article>
        )
      })}
    </div>
  )
}
