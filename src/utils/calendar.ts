import { StudyPlan } from '../types';

// Generate standard .ics (iCalendar) file content for student calendar import (Google Calendar, Outlook, Apple Calendar)
export function generateICalendar(plan: StudyPlan): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudyPulse//College AI Study Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:StudyPulse Schedule',
  ];

  plan.days.forEach((day) => {
    day.sessions.forEach((session) => {
      // Parse start time (e.g. "09:00 AM" or "02:30 PM")
      const timeParts = session.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      let hours = 9;
      let minutes = 0;
      if (timeParts) {
        hours = parseInt(timeParts[1], 10);
        minutes = parseInt(timeParts[2], 10);
        const meridiem = timeParts[3].toUpperCase();
        if (meridiem === 'PM' && hours < 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
      }

      const dateClean = session.date.replace(/-/g, '');
      const startHourStr = String(hours).padStart(2, '0');
      const startMinStr = String(minutes).padStart(2, '0');
      const dtStart = `${dateClean}T${startHourStr}${startMinStr}00`;

      // End time based on duration
      const totalMinutes = hours * 60 + minutes + (session.durationMinutes || 45);
      const endHour = Math.floor(totalMinutes / 60) % 24;
      const endMin = totalMinutes % 60;
      const endHourStr = String(endHour).padStart(2, '0');
      const endMinStr = String(endMin).padStart(2, '0');
      const dtEnd = `${dateClean}T${endHourStr}${endMinStr}00`;

      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${session.id}@studypulse.ai`);
      lines.push(`DTSTAMP:${dateClean}T000000Z`);
      lines.push(`DTSTART:${dtStart}`);
      lines.push(`DTEND:${dtEnd}`);
      lines.push(`SUMMARY:[${session.subjectName}] ${session.topic}`);
      lines.push(`DESCRIPTION:Subject: ${session.subjectName}\\nDifficulty: ${session.difficulty}\\nTechnique: ${session.technique}\\nPriority: ${session.priority}`);
      lines.push(`STATUS:${session.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE'}`);
      lines.push('END:VEVENT');
    });
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadCalendarICS(plan: StudyPlan, filename = 'study-plan.ics') {
  const content = generateICalendar(plan);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportPlanJSON(plan: StudyPlan, filename = 'study-plan.json') {
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
