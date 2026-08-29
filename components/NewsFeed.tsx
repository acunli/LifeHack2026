'use client'

const NEWS_ARTICLES = [
  {
    id: 1,
    title: 'Singapore Pushes for 80% Energy-Efficient Buildings by 2030',
    source: 'The Straits Times',
    date: 'Aug 28, 2026',
    summary:
      'The government announced new targets requiring 80% of existing buildings to meet green standards within four years, with S$200M in retrofitting grants.',
    color: '#2d5a3d',
  },
  {
    id: 2,
    title: 'HDB Flats See 15% Drop in Energy Use After Smart Plug Trial',
    source: 'Channel NewsAsia',
    date: 'Aug 26, 2026',
    summary:
      'A pilot programme across 12 blocks in Tampines reduced average household consumption by 15% using real-time monitoring and automated scheduling.',
    color: '#3d4a5a',
  },
  {
    id: 3,
    title: 'New Aircon Standards: What Singapore Residents Need to Know',
    source: 'Today Online',
    date: 'Aug 25, 2026',
    summary:
      'Updated minimum energy efficiency ratios take effect in January. Units sold after the deadline must meet stricter 5-tick standards.',
    color: '#5a3d2d',
  },
  {
    id: 4,
    title: 'Community Challenge: Block vs Block Energy Savings Showdown',
    source: 'WattWise Blog',
    date: 'Aug 24, 2026',
    summary:
      'Neighbouring blocks compete to cut the most energy this September. Prizes include smart home kits and grocery vouchers for top performers.',
    color: '#2d3d5a',
  },
  {
    id: 5,
    title: 'LED Switch Saves Households Up to S$200 Per Year',
    source: 'Lianhe Zaobao',
    date: 'Aug 22, 2026',
    summary:
      'A study by the Energy Market Authority found that full LED adoption in HDB flats cuts lighting costs by 80% compared to halogen bulbs.',
    color: '#4a5a2d',
  },
  {
    id: 6,
    title: 'Washing Machine Energy Labels Overhauled for 2027',
    source: 'HardwareZone',
    date: 'Aug 20, 2026',
    summary:
      'New labelling rules will display annual kWh estimates prominently, helping consumers compare running costs at a glance.',
    color: '#5a2d4a',
  },
  {
    id: 7,
    title: 'Night Owl? Running Appliances After 11 PM Lowers Block Demand',
    source: 'Mothership',
    date: 'Aug 19, 2026',
    summary:
      'SP Group data shows shifting washing and dishwashing to off-peak hours reduces peak load by up to 8%, benefiting the entire block.',
    color: '#2d5a5a',
  },
  {
    id: 8,
    title: 'Refrigerator Maintenance: The 5-Minute Check That Saves 10%',
    source: 'Her World',
    date: 'Aug 18, 2026',
    summary:
      'Cleaning condenser coils twice a year can reduce fridge energy consumption by 10%. Most Singaporean households skip this simple task.',
    color: '#5a5a2d',
  },
]

export default function NewsFeed() {
  return (
    <div className="news-feed">
      <div className="news-scroll">
        {NEWS_ARTICLES.map((article) => (
          <article key={article.id} className="news-card">
            <div
              className="news-thumb"
              style={{ background: article.color }}
            >
              <span className="news-thumb-icon">⚡</span>
            </div>
            <div className="news-body">
              <div className="news-meta">
                <span className="news-source">{article.source}</span>
                <span className="news-date">{article.date}</span>
              </div>
              <h4 className="news-title">{article.title}</h4>
              <p className="news-summary">{article.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
