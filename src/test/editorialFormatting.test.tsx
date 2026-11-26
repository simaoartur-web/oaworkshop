import { describe, expect, it } from 'vitest';
import { buildUnifiedActivityEvents } from '../data/activitySelector';
import type { ActivityDomain } from '../data/editorialReportsTypes';
import { DEMO_USERS } from '../data/fixtures';
import { DEMO_MODEL_CATALOG } from '../data/modelAssetRepository';
import { getProjectLibrarySnapshot } from '../data/projectLibraryRepository';
import {
  getPublicationAuditSnapshot,
  transitionProjectPublication,
} from '../data/publicationsRepository';
import {
  buildStudioReportSnapshot,
  serializeReportSnapshotJson,
} from '../data/reportsSelector';
import type { DeskTaskStatus } from '../data/studioDeskTypes';
import { getTasksSnapshot } from '../data/tasksRepository';
import { getTechnicalLibrarySnapshot } from '../data/technicalLibraryRepository';
import type { ProjectStatus, PublicationStatus } from '../data/types';
import { EDITORIAL_CONTROL_I18N } from '../features/editorial-control/i18n';
import {
  formatActivityDomainLabel,
  formatDemoAuthorDisplay,
  formatEditorialDate,
  formatProjectStatusLabel,
  formatPublicationStatusLabel,
  formatStudioBaseLabel,
  formatTaskStatusLabel,
} from '../utils/editorialFormatting';

const RAW_ISO_DATE_REGEX = /\b\d{4}-\d{2}-\d{2}\b/;
const RAW_TASK_ENUM_REGEX = /\b(in_progress|pending|completed)\b/;
const RAW_PUB_ENUM_REGEX =
  /\b(PRIVATE|REQUESTED|APPROVED|PUBLISHED-DEMO|REJECTED|UNPUBLISHED|published-demo)\b/;

describe('editorialFormatting utilities (Phase 08.3 — R-04)', () => {
  describe('formatEditorialDate', () => {
    it('formats pure YYYY-MM-DD dates deterministically in PT and EN without timezone shift', () => {
      expect(formatEditorialDate('2026-11-10', 'pt')).toBe('10 Nov 2026');
      expect(formatEditorialDate('2026-11-10', 'en')).toBe('Nov 10, 2026');

      // Boundary dates around year/month edges must never shift a day backwards or forwards
      expect(formatEditorialDate('2026-01-01', 'pt')).toBe('01 Jan 2026');
      expect(formatEditorialDate('2026-01-01', 'en')).toBe('Jan 01, 2026');
      expect(formatEditorialDate('2026-12-31', 'pt')).toBe('31 Dez 2026');
      expect(formatEditorialDate('2026-12-31', 'en')).toBe('Dec 31, 2026');
    });

    it('formats full ISO timestamps deterministically in UTC', () => {
      expect(formatEditorialDate('2026-11-10T00:00:00Z', 'pt')).toBe(
        '10 Nov 2026',
      );
      expect(formatEditorialDate('2026-11-10T00:00:00Z', 'en')).toBe(
        'Nov 10, 2026',
      );
      expect(formatEditorialDate('2026-11-10T23:59:59Z', 'pt')).toBe(
        '10 Nov 2026',
      );
      expect(formatEditorialDate('2026-11-10T23:59:59Z', 'en')).toBe(
        'Nov 10, 2026',
      );
    });

    it('handles empty or invalid date strings gracefully without throwing', () => {
      expect(formatEditorialDate('', 'pt')).toBe('');
      expect(formatEditorialDate('   ', 'en')).toBe('');
      expect(formatEditorialDate('2026-02-30', 'pt')).toBe('2026-02-30');
      expect(formatEditorialDate('not-a-date', 'en')).toBe('not-a-date');
    });
  });

  describe('formatStudioBaseLabel', () => {
    it('localizes Milão to Milan in EN while preserving Maputo and canonical PT values', () => {
      expect(formatStudioBaseLabel('Maputo', 'pt')).toBe('Maputo');
      expect(formatStudioBaseLabel('Maputo', 'en')).toBe('Maputo');
      expect(formatStudioBaseLabel('Milão', 'pt')).toBe('Milão');
      expect(formatStudioBaseLabel('Milão', 'en')).toBe('Milan');
    });
  });

  describe('enum formatters (PT & EN)', () => {
    it('formats all DeskTaskStatus values in PT and EN', () => {
      const cases: Array<[DeskTaskStatus, string, string]> = [
        ['pending', 'Pendente', 'Pending'],
        ['in_progress', 'Em Curso', 'In Progress'],
        ['completed', 'Concluída', 'Completed'],
      ];
      for (const [status, expectedPt, expectedEn] of cases) {
        expect(formatTaskStatusLabel(status, 'pt')).toBe(expectedPt);
        expect(formatTaskStatusLabel(status, 'en')).toBe(expectedEn);
      }
    });

    it('formats all PublicationStatus values in PT and EN', () => {
      const cases: Array<[PublicationStatus, string, string]> = [
        ['private', 'Privado', 'Private'],
        ['requested', 'Solicitado', 'Requested'],
        ['approved', 'Aprovado', 'Approved'],
        ['published-demo', 'Publicado (Demo)', 'Published (Demo)'],
        ['rejected', 'Rejeitado', 'Rejected'],
        ['unpublished', 'Despublicado', 'Unpublished'],
      ];
      for (const [status, expectedPt, expectedEn] of cases) {
        expect(formatPublicationStatusLabel(status, 'pt')).toBe(expectedPt);
        expect(formatPublicationStatusLabel(status, 'en')).toBe(expectedEn);
      }
    });

    it('formats all ActivityDomain values in PT and EN', () => {
      const cases: Array<[ActivityDomain, string, string]> = [
        ['project', 'Projectos', 'Projects'],
        ['task', 'Tarefas', 'Tasks'],
        ['technical_library', 'Biblioteca Técnica', 'Technical Library'],
        ['publication', 'Publicações', 'Publications'],
      ];
      for (const [domain, expectedPt, expectedEn] of cases) {
        expect(formatActivityDomainLabel(domain, 'pt')).toBe(expectedPt);
        expect(formatActivityDomainLabel(domain, 'en')).toBe(expectedEn);
      }
    });

    it('formats all ProjectStatus values in PT and EN', () => {
      const cases: Array<[ProjectStatus, string, string]> = [
        ['concept', 'Conceito', 'Concept'],
        ['design', 'Projecto', 'Design'],
        ['in_progress', 'Em Curso', 'In Progress'],
        ['review', 'Em Revisão', 'In Review'],
        ['completed', 'Concluído', 'Completed'],
        ['archived', 'Arquivado', 'Archived'],
      ];
      for (const [status, expectedPt, expectedEn] of cases) {
        expect(formatProjectStatusLabel(status, 'pt')).toBe(expectedPt);
        expect(formatProjectStatusLabel(status, 'en')).toBe(expectedEn);
      }
    });
  });

  describe('formatDemoAuthorDisplay', () => {
    it('adds a uniform (Demo) suffix without duplicating an existing suffix', () => {
      expect(formatDemoAuthorDisplay('Helena Mondlane')).toBe(
        'Helena Mondlane (Demo)',
      );
      expect(formatDemoAuthorDisplay('Helena Mondlane (Demo)')).toBe(
        'Helena Mondlane (Demo)',
      );
      expect(formatDemoAuthorDisplay('  Mateo Conti (demo)  ')).toBe(
        'Mateo Conti (Demo)',
      );
      expect(formatDemoAuthorDisplay('')).toBe('');
      expect(formatDemoAuthorDisplay('   ')).toBe('');
    });
  });

  describe('data selectors & i18n leak prevention', () => {
    it('ensures activitySelector emits zero raw enums, zero raw ISO dates in summaries/codes, and uniform (Demo) authors', () => {
      const projects = getProjectLibrarySnapshot().allRecords;
      const tasks = getTasksSnapshot().allTasks;
      const techRefs = getTechnicalLibrarySnapshot().allReferences;
      const pubEntries = getPublicationAuditSnapshot().allEntries;

      const events = buildUnifiedActivityEvents(
        projects,
        tasks,
        techRefs,
        pubEntries,
      );
      expect(events.length).toBeGreaterThan(0);

      for (const event of events) {
        expect(event.actorName).toMatch(/\(Demo\)$/);
        expect(event.actorName).not.toMatch(/\(Demo\)\s*\(Demo\)/i);

        expect(event.code).not.toMatch(RAW_PUB_ENUM_REGEX);
        expect(event.summary.pt).not.toMatch(RAW_ISO_DATE_REGEX);
        expect(event.summary.en).not.toMatch(RAW_ISO_DATE_REGEX);
        expect(event.summary.pt).not.toMatch(RAW_TASK_ENUM_REGEX);
        expect(event.summary.en).not.toMatch(RAW_TASK_ENUM_REGEX);
      }
    });

    it('ensures defaultTransitionNote in publicationsRepository uses localized status labels instead of raw enums', () => {
      const result = transitionProjectPublication(
        'sd-proj-oa-26-101',
        'requested',
        DEMO_USERS[0].id,
      );
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.entry.note.pt).toContain('Privado');
        expect(result.entry.note.pt).toContain('Solicitado');
        expect(result.entry.note.pt).not.toContain('"private"');
        expect(result.entry.note.pt).not.toContain('"requested"');
        expect(result.entry.note.en).toContain('Private');
        expect(result.entry.note.en).toContain('Requested');
        expect(result.entry.note.en).not.toContain('"private"');
        expect(result.entry.note.en).not.toContain('"requested"');
      }
    });

    it('ensures DEMO_MODEL_CATALOG sizeHint contains no Portuguese-only wording', () => {
      for (const entry of DEMO_MODEL_CATALOG) {
        expect(entry.sizeHint).not.toMatch(/Estudo Demo|autónomo/i);
      }
    });

    it('removes literal mode: local-demo from editorial prose while preserving mode: "local-demo" in JSON export payload', () => {
      expect(EDITORIAL_CONTROL_I18N.pt.reports.honestBanner).not.toContain(
        'mode: local-demo',
      );
      expect(EDITORIAL_CONTROL_I18N.en.reports.honestBanner).not.toContain(
        'mode: local-demo',
      );

      const snapshot = buildStudioReportSnapshot(
        getProjectLibrarySnapshot().allRecords,
        getTasksSnapshot().allTasks,
        getTechnicalLibrarySnapshot().allReferences,
        getPublicationAuditSnapshot().allEntries,
      );
      const parsed = JSON.parse(serializeReportSnapshotJson(snapshot, 'en'));
      expect(parsed.mode).toBe('local-demo');
    });
  });
});
