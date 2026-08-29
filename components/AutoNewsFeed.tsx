'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const NEWS_ARTICLES = [
  {
    id: 1,
    title: 'Singapore Pushes for 80% Energy-Efficient Buildings by 2030',
    source: 'The Straits Times',
    date: 'Aug 28',
    summary: 'New targets requiring 80% of existing buildings to meet green standards within four years.',
    color: '#2d5a3d',
    icon: '🏢',
  },
  {
    id: 2,
    title: 'HDB Flats See 15% Drop in Energy Use After Smart Plug Trial',
    source: 'Channel NewsAsia',
    date: 'Aug 26',
    summary: 'A pilot programme across 12 blocks in Tampines reduced household consumption by 15%.',
    color: '#3d4a5a',
    icon: '🏠',
  },
  {
    id: 3,
    title: 'New Aircon Standards: What Singapore Residents Need to Know',
    source: 'Today Online',
    date: 'Aug 25',
    summary: 'Updated minimum energy efficiency ratios take effect in January.',
    color: '#5a3d2d',
    icon: '❄️',
  },
  {
    id: 4,
    title: 'Community Challenge: Block vs Block Energy Savings Showdown',
    source: 'WattWise Blog',
    date: 'Aug 24',
    summary: 'Neighbouring blocks compete to cut the most energy this September.',
    color: '#2d3d5a',
    icon: '🏆',
  },
  {
    id: 5,
    title: 'LED Switch Saves Households Up to S$200 Per Year',
    source: 'Lianhe Zaobao',
    date: 'Aug 22',
    summary: 'Full LED adoption in HDB flats cuts lighting costs by 80%.',
    color: '#4a5a2d',
    icon: '💡',
  },
  {
    id: 6,
    title: 'Washing Machine Energy Labels Overhauled for 2027',
    source: 'HardwareZone',
    date: 'Aug 20',
    summary: 'New labelling rules display annual kWh estimates prominently.',
    color: '#5a2d4a',
    icon: '🧺',
  },
  {
    id: 7,
    title: 'Night Owl? Running Appliances After 11 PM Lowers Block Demand',
    source: 'Mothership',
    date: 'Aug 19',
    summary: 'Shifting washing to off-peak hours reduces peak load by up to 8%.',
    color: '#2d5a5a',
    icon: '🌙',
  },
  {
    id: 8,
    title: 'Refrigerator Maintenance: The 5-Minute Check That Saves 10%',
    source: 'Her World',
    date: 'Aug 18',
    summary: 'Cleaning condenser coils twice a year reduces fridge energy by 10%.',
    color: '#5a5a2d',
    icon: '🧊',
  },
]

export default function AutoNewsFeed() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return
    const cards = scrollRef.current.children
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [])

  const advance = useCallback(() => {
    setActiveIndex((prev) => {
      const next = (prev + 1) % NEWS_ARTICLES.length
      scrollToIndex(next)
      return next
    })
  }, [scrollToIndex])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!isHovered) {
      intervalRef.current = setInterval(advance, 5000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isHovered, advance])

  return (
    <div
      className="auto-news-feed"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="auto-news-scroll" ref={scrollRef}>
        {NEWS_ARTICLES.map((article, i) => (
          <article
            key={article.id}
            className={'auto-news-card' + (i === activeIndex ? ' active' : '')}
            onClick={() => {
              setActiveIndex(i)
              scrollToIndex(i)
            }}
          >
            <div className="auto-news-thumb" style={{ background: article.color }}>
              <span className="auto-news-icon">{article.icon}</span>
            </div>
            <div className="auto-news-body">
              <div className="auto-news-meta">
                <span className="auto-news-source">{article.source}</span>
                <span className="auto-news-date">{article.date}</span>
              </div>
              <h4 className="auto-news-title">{article.title}</h4>
              <p className="auto-news-summary">{article.summary}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="auto-news-dots">
        {NEWS_ARTICLES.map((_, i) => (
          <button
            key={i}
            className={'auto-news-dot' + (i === activeIndex ? ' active' : '')}
            onClick={() => {
              setActiveIndex(i)
              scrollToIndex(i)
            }}
            aria-label={`Go to article ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
