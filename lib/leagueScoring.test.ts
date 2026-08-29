import { describe, expect, it } from 'vitest'
import { computeScore as computeApartmentScore } from './scoring'
import { computeScore as computeLeagueScore, rankTier } from './leagueScoring'

describe('league scoring compatibility', () => {
  it.each([
    [100, 100],
    [120, 100],
    [175, 100],
    [10, 0],
    [10, -5],
  ])('matches the apartment score for %i kWh against %i kWh', (usage, baseline) => {
    const apartment = computeApartmentScore({
      roomNumber: 'test',
      totalConsumptionKwh: usage,
      referenceConsumptionKwh: baseline,
      costPerKwh: 0.2994,
    })

    expect(computeLeagueScore({ usageKwh: usage, baselineKwh: baseline })).toBe(apartment.score)
    expect(rankTier(apartment.score)).toBe(apartment.status)
  })
})
