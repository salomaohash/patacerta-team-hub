import { describe, expect, it } from 'vitest';
import { CHECKIN_DAYS, checkinDue, decisionGuide, householdAgreement } from './adoption-guide.ts';
import { animals } from './animals';
import type { QuizAnswers } from './matching';
describe('responsible adoption rules', () => {
  it('keeps low compatibility visible with its actual concerns', () => {
    const a = animals[0]; if (!a) throw new Error('Missing animal');
    const q: QuizAnswers = { hoursAway:2,housing:0,dailyTime:0,activity:0,kids:0,pets:3,experience:0,routine:2,openness:2 };
    const guide = decisionGuide(q,a); expect(guide.match.score).toBeLessThan(55); expect(guide.considerations).toContain('housing'); expect(guide.considerations).toContain('time');
  });
  it('check-ins occur at 7, 30, 60 and 90 days', () => expect(CHECKIN_DAYS).toEqual([7,30,60,90]));
  it('does not open a 30-day check-in before the due date', () => { expect(checkinDue('2026-10-01',30,new Date('2026-10-30'))).toBe(false); expect(checkinDue('2026-10-01',30,new Date('2026-10-31'))).toBe(true); });
  it('excludes personal answers without consent from the household summary', () => {
    expect(householdAgreement([{consent:true,activity:0,dailyTime:1,routine:0},{consent:false,activity:2,dailyTime:2,routine:2}])).toEqual({count:1,differences:[]});
  });
});
