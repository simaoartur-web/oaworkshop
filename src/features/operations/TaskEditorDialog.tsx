import { AlertCircle, X } from 'lucide-react';
import { useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { DEMO_USERS, DEPARTMENTS } from '../../data/fixtures';
import type {
  CanonicalTaskRecord,
  CreateTaskInput,
  UpdateTaskInput,
} from '../../data/operationsTypes';
import type { CanonicalProjectRecord } from '../../data/projectLibraryTypes';
import { isValidIsoCalendarDate } from '../../data/projectLibraryRepository';
import type { DeskPriorityLevel, DeskTaskStatus } from '../../data/studioDeskTypes';
import { TASKS_LIMITS } from '../../data/tasksRepository';
import type { AppLanguage, DepartmentId } from '../../data/types';
import { useDialogFocusTrap } from '../../design-system/useDialogFocusTrap';
import { pickLocalized } from '../../locales';
import { OPERATIONS_I18N } from './i18n';

interface TaskEditorDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialTask?: CanonicalTaskRecord | null;
  projects: readonly CanonicalProjectRecord[];
  defaultAssigneeUserId: string;
  language: AppLanguage;
  onCreate: (input: CreateTaskInput) => void;
  onUpdate: (id: string, patch: UpdateTaskInput) => void;
  onClose: () => void;
}

function TaskEditorDialogContent({
  mode,
  initialTask,
  projects,
  defaultAssigneeUserId,
  language,
  onCreate,
  onUpdate,
  onClose,
}: Omit<TaskEditorDialogProps, 'open'>) {
  const dict = OPERATIONS_I18N[language];
  const titleId = useId();
  const portalRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const fallbackProject = projects[0];
  const [titleText, setTitleText] = useState(
    initialTask ? pickLocalized(initialTask.title, language) : '',
  );
  const [detailText, setDetailText] = useState(
    initialTask ? pickLocalized(initialTask.detail, language) : '',
  );
  const [projectId, setProjectId] = useState(
    initialTask?.projectId ?? fallbackProject?.identity.id ?? '',
  );
  const [departmentId, setDepartmentId] = useState<DepartmentId>(
    initialTask?.departmentId ??
      fallbackProject?.classification.departmentId ??
      'architecture',
  );
  const [assigneeUserId, setAssigneeUserId] = useState(
    initialTask?.assigneeUserId ?? defaultAssigneeUserId,
  );
  const [priority, setPriority] = useState<DeskPriorityLevel>(
    initialTask?.priority ?? 'medium',
  );
  const [status, setStatus] = useState<DeskTaskStatus>(
    initialTask?.status ?? 'pending',
  );
  const [dueDateIso, setDueDateIso] = useState(
    initialTask?.dueDateIso ?? '2026-11-18',
  );
  const [referenceTag, setReferenceTag] = useState(
    initialTask ? pickLocalized(initialTask.referenceTag, language) : '',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useDialogFocusTrap({
    open: true,
    containerRef: dialogRef,
    portalRef,
    initialFocusRef: titleInputRef,
    onClose,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = titleText.trim();
    const trimmedDetail = detailText.trim();
    const trimmedDate = dueDateIso.trim();

    if (!trimmedTitle) {
      setErrorMessage(dict.editor.validationTitleRequired);
      titleInputRef.current?.focus();
      return;
    }
    if (!trimmedDetail) {
      setErrorMessage(dict.editor.validationDetailRequired);
      return;
    }
    if (!isValidIsoCalendarDate(trimmedDate)) {
      setErrorMessage(dict.editor.validationDateInvalid);
      return;
    }

    try {
      if (mode === 'edit' && initialTask) {
        const cleanTag = referenceTag.trim();
        onUpdate(initialTask.id, {
          title:
            language === 'en'
              ? { pt: initialTask.title.pt, en: trimmedTitle }
              : { pt: trimmedTitle, en: initialTask.title.en },
          detail:
            language === 'en'
              ? { pt: initialTask.detail.pt, en: trimmedDetail }
              : { pt: trimmedDetail, en: initialTask.detail.en },
          projectId,
          departmentId,
          assigneeUserId,
          priority,
          status,
          dueDateIso: trimmedDate,
          referenceTag: cleanTag
            ? language === 'en'
              ? { pt: initialTask.referenceTag.pt, en: cleanTag }
              : { pt: cleanTag, en: initialTask.referenceTag.en }
            : initialTask.referenceTag,
        });
      } else {
        onCreate({
          titlePt: trimmedTitle,
          titleEn: trimmedTitle,
          detailPt: trimmedDetail,
          detailEn: trimmedDetail,
          projectId,
          departmentId,
          assigneeUserId,
          priority,
          status,
          dueDateIso: trimmedDate,
          referenceTagPt: referenceTag.trim() || undefined,
          referenceTagEn: referenceTag.trim() || undefined,
        });
      }
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : dict.editor.errorFallback,
      );
    }
  };

  const departmentEntries = Object.values(DEPARTMENTS);

  return createPortal(
    <div
      ref={portalRef}
      data-oa-dialog-portal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 px-3 sm:px-6 py-6"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto border border-white/20 bg-[#111111] text-white shadow-2xl focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 py-4 bg-[#0A0A0A] oa-hairline-b">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.20em] text-[#CE826D]">
              {mode === 'edit' ? dict.editor.editCode : dict.editor.createCode}
            </p>
            <h2
              id={titleId}
              className="mt-1 text-lg sm:text-xl font-light tracking-tight text-white"
            >
              {mode === 'edit' ? dict.editor.editTitle : dict.editor.createTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={dict.common.closeDialog}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-white/14 text-[#BDBDBD] hover:text-white hover:border-white/35 transition-colors cursor-pointer shrink-0"
          >
            <X size={17} strokeWidth={1.35} aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6 space-y-5">
          <p className="text-xs text-[#BDBDBD] border-l-2 border-[#A65D4A] bg-[#161616] px-3.5 py-2">
            {dict.editor.honestNotice}
          </p>

          {errorMessage && (
            <div
              role="alert"
              data-testid="task-editor-error"
              className="border border-[#A65D4A] bg-[#21100E] px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-[#F5C2B8]"
            >
              <AlertCircle
                size={16}
                strokeWidth={1.6}
                aria-hidden="true"
                className="text-[#E58573] shrink-0 mt-0.5"
              />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="oa-task-title"
                className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
              >
                {dict.editor.fieldTitle}
              </label>
              <input
                ref={titleInputRef}
                id="oa-task-title"
                type="text"
                required
                maxLength={TASKS_LIMITS.MAX_TITLE_LENGTH}
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                placeholder={dict.editor.fieldTitlePlaceholder}
                className="oa-field-input mt-1"
              />
            </div>

            <div>
              <label
                htmlFor="oa-task-detail"
                className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
              >
                {dict.editor.fieldDetail}
              </label>
              <textarea
                id="oa-task-detail"
                rows={3}
                required
                maxLength={TASKS_LIMITS.MAX_DETAIL_LENGTH}
                value={detailText}
                onChange={(e) => setDetailText(e.target.value)}
                placeholder={dict.editor.fieldDetailPlaceholder}
                className="w-full mt-1.5 bg-[#0B0B0B] border border-white/18 px-3 py-2.5 text-sm text-white placeholder:text-[#9E9E9E] focus:border-[#A65D4A] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="oa-task-project"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
                >
                  {dict.editor.fieldProject}
                </label>
                <select
                  id="oa-task-project"
                  value={projectId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setProjectId(nextId);
                    const matched = projects.find((p) => p.identity.id === nextId);
                    if (matched && mode === 'create') {
                      setDepartmentId(matched.classification.departmentId);
                    }
                  }}
                  className="oa-field-input mt-1 bg-[#111111]"
                >
                  {projects.map((project) => (
                    <option
                      key={project.identity.id}
                      value={project.identity.id}
                      className="bg-[#111111]"
                    >
                      {project.identity.code} ·{' '}
                      {pickLocalized(project.editorial.title, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="oa-task-department"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
                >
                  {dict.editor.fieldDepartment}
                </label>
                <select
                  id="oa-task-department"
                  value={departmentId}
                  onChange={(e) =>
                    setDepartmentId(e.target.value as DepartmentId)
                  }
                  className="oa-field-input mt-1 bg-[#111111]"
                >
                  {departmentEntries.map((dept) => (
                    <option
                      key={dept.id}
                      value={dept.id}
                      className="bg-[#111111]"
                    >
                      {dept.code} · {pickLocalized(dept.name, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="oa-task-assignee"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
                >
                  {dict.editor.fieldAssignee}
                </label>
                <select
                  id="oa-task-assignee"
                  value={assigneeUserId}
                  onChange={(e) => setAssigneeUserId(e.target.value)}
                  className="oa-field-input mt-1 bg-[#111111]"
                >
                  {DEMO_USERS.map((user) => (
                    <option
                      key={user.id}
                      value={user.id}
                      className="bg-[#111111]"
                    >
                      {user.code} · {user.name} ({user.studioBase})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="oa-task-due"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
                >
                  {dict.editor.fieldDueDate}
                </label>
                <input
                  id="oa-task-due"
                  type="date"
                  required
                  value={dueDateIso}
                  onChange={(e) => setDueDateIso(e.target.value)}
                  className="oa-field-input mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="oa-task-priority"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
                >
                  {dict.editor.fieldPriority}
                </label>
                <select
                  id="oa-task-priority"
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as DeskPriorityLevel)
                  }
                  className="oa-field-input mt-1 bg-[#111111]"
                >
                  <option value="high" className="bg-[#111111]">
                    {dict.priorities.high}
                  </option>
                  <option value="medium" className="bg-[#111111]">
                    {dict.priorities.medium}
                  </option>
                  <option value="base" className="bg-[#111111]">
                    {dict.priorities.base}
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="oa-task-status"
                  className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
                >
                  {dict.editor.fieldStatus}
                </label>
                <select
                  id="oa-task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DeskTaskStatus)}
                  className="oa-field-input mt-1 bg-[#111111]"
                >
                  <option value="pending" className="bg-[#111111]">
                    {dict.statuses.pending}
                  </option>
                  <option value="in_progress" className="bg-[#111111]">
                    {dict.statuses.in_progress}
                  </option>
                  <option value="completed" className="bg-[#111111]">
                    {dict.statuses.completed}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="oa-task-tag"
                className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#E0E0E0]"
              >
                {dict.editor.fieldReferenceTag}
              </label>
              <input
                id="oa-task-tag"
                type="text"
                maxLength={TASKS_LIMITS.MAX_TAG_LENGTH}
                value={referenceTag}
                onChange={(e) => setReferenceTag(e.target.value)}
                placeholder={dict.editor.fieldReferenceTagPlaceholder}
                className="oa-field-input mt-1"
              />
            </div>
          </div>

          <div className="pt-4 oa-hairline-t flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 border border-white/18 bg-transparent hover:border-white/40 text-xs font-medium uppercase tracking-[0.16em] text-[#E0E0E0] hover:text-white transition-colors cursor-pointer"
            >
              {dict.common.cancel}
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 bg-[#A65D4A] hover:bg-[#B86B57] text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors cursor-pointer"
            >
              {mode === 'edit' ? dict.editor.submitEdit : dict.editor.submitCreate}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export function TaskEditorDialog(props: TaskEditorDialogProps) {
  if (!props.open) {
    return null;
  }
  return (
    <TaskEditorDialogContent
      key={`${props.mode}:${props.initialTask?.id ?? 'new'}`}
      mode={props.mode}
      initialTask={props.initialTask}
      projects={props.projects}
      defaultAssigneeUserId={props.defaultAssigneeUserId}
      language={props.language}
      onCreate={props.onCreate}
      onUpdate={props.onUpdate}
      onClose={props.onClose}
    />
  );
}
