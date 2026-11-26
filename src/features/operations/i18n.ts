import type { CalendarEventKind } from '../../data/operationsTypes';
import type { DeskPriorityLevel, DeskTaskStatus } from '../../data/studioDeskTypes';
import type { AppLanguage } from '../../data/types';

export interface OperationsDictionary {
  common: {
    localSavedBadge: string;
    resetFilters: string;
    allOption: string;
    clearAction: string;
    openProjectDossier: string;
    openTask: string;
    cancel: string;
    save: string;
    edit: string;
    closeDialog: string;
  };
  statuses: Record<DeskTaskStatus, string>;
  priorities: Record<DeskPriorityLevel, string>;
  tasks: {
    pageTitle: string;
    eyebrow: string;
    heading: string;
    subtitle: string;
    newTaskCta: string;
    viewListLabel: string;
    viewBoardLabel: string;
    viewSwitcherAria: string;
    scopes: {
      my_work: string;
      role_focus: string;
      all: string;
    };
    filters: {
      scopeAria: string;
      statusLabel: string;
      priorityLabel: string;
      departmentLabel: string;
      projectLabel: string;
      searchLabel: string;
      searchPlaceholder: string;
    };
    counters: {
      pending: string;
      inProgress: string;
      completed: string;
      showingPrefix: string;
    };
    actions: {
      start: string;
      complete: string;
      reopen: string;
      movePending: string;
      moveInProgress: string;
      moveCompleted: string;
    };
    spotlight: {
      tag: string;
      invalidNotice: string;
      clearAria: string;
    };
    empty: {
      title: string;
      body: string;
      columnEmpty: string;
    };
    announcements: {
      statusUpdated: string;
      taskCreated: string;
      taskUpdated: string;
    };
    columns: {
      code: string;
      task: string;
      project: string;
      assignee: string;
      due: string;
      priority: string;
      status: string;
      actions: string;
    };
    board: {
      regionAria: string;
      columnCountSuffix: string;
    };
  };
  editor: {
    createCode: string;
    editCode: string;
    createTitle: string;
    editTitle: string;
    honestNotice: string;
    fieldTitle: string;
    fieldTitlePlaceholder: string;
    fieldDetail: string;
    fieldDetailPlaceholder: string;
    fieldProject: string;
    fieldDepartment: string;
    fieldAssignee: string;
    fieldPriority: string;
    fieldStatus: string;
    fieldDueDate: string;
    fieldReferenceTag: string;
    fieldReferenceTagPlaceholder: string;
    submitCreate: string;
    submitEdit: string;
    validationTitleRequired: string;
    validationDetailRequired: string;
    validationDateInvalid: string;
    errorFallback: string;
  };
  calendar: {
    pageTitle: string;
    eyebrow: string;
    heading: string;
    subtitle: string;
    viewMonthLabel: string;
    viewAgendaLabel: string;
    viewSwitcherAria: string;
    prevMonthAria: string;
    nextMonthAria: string;
    demoMonthCta: string;
    todayCta: string;
    kindLabels: Record<CalendarEventKind, string>;
    filters: {
      kindsAria: string;
      departmentLabel: string;
      projectLabel: string;
      studioBaseLabel: string;
      studioBases: {
        all: string;
        Maputo: string;
        Milão: string;
      };
    };
    weekdays: readonly string[];
    months: readonly string[];
    detailPanel: {
      selectedDayEyebrow: string;
      allMonthEyebrow: string;
      eventsCountLabel: (count: number) => string;
      emptyDayTitle: string;
      emptyDayBody: string;
      emptyFilterTitle: string;
      emptyFilterBody: string;
      openLinkLabel: string;
      studioBasePrefix: string;
    };
  };
}

const pt: OperationsDictionary = {
  common: {
    localSavedBadge: 'Guardado neste navegador (demo)',
    resetFilters: 'Limpar filtros',
    allOption: 'Todos',
    clearAction: 'Limpar',
    openProjectDossier: 'Abrir dossier',
    openTask: 'Abrir tarefa',
    cancel: 'Cancelar',
    save: 'Guardar',
    edit: 'Editar',
    closeDialog: 'Fechar diálogo',
  },
  statuses: {
    pending: 'Pendente',
    in_progress: 'Em curso',
    completed: 'Concluída',
  },
  priorities: {
    high: 'Alta',
    medium: 'Média',
    base: 'Base',
  },
  tasks: {
    pageTitle: 'Tarefas — O+A Workspace',
    eyebrow: 'PRANCHA 03 · TAREFAS · MODO DEMO',
    heading: 'Tarefas do Atelier',
    subtitle:
      'Lista técnica e quadro operacional sincronizados com o Studio Desk e o Calendário. Alterações guardadas apenas neste navegador (demo).',
    newTaskCta: 'Nova tarefa',
    viewListLabel: 'Lista Técnica',
    viewBoardLabel: 'Quadro Operacional',
    viewSwitcherAria: 'Modo de visualização de tarefas',
    scopes: {
      my_work: 'As minhas tarefas',
      role_focus: 'Foco do papel',
      all: 'Todas',
    },
    filters: {
      scopeAria: 'Âmbito de tarefas',
      statusLabel: 'Estado',
      priorityLabel: 'Prioridade',
      departmentLabel: 'Departamento',
      projectLabel: 'Projecto',
      searchLabel: 'Pesquisar tarefas',
      searchPlaceholder: 'Código, título ou projecto…',
    },
    counters: {
      pending: 'Pendentes',
      inProgress: 'Em curso',
      completed: 'Concluídas',
      showingPrefix: 'A mostrar',
    },
    actions: {
      start: 'Iniciar',
      complete: 'Concluir',
      reopen: 'Reabrir',
      movePending: 'Pendente',
      moveInProgress: 'Em curso',
      moveCompleted: 'Concluir',
    },
    spotlight: {
      tag: 'TAREFA EM DESTAQUE · LINK DIRECTO',
      invalidNotice: 'A tarefa indicada no URL não foi encontrada nesta demonstração',
      clearAria: 'Limpar destaque de tarefa',
    },
    empty: {
      title: 'Nenhuma tarefa corresponde aos filtros activos',
      body: 'Ajuste o âmbito, os filtros ou crie uma nova tarefa demonstrativa associada a um projecto.',
      columnEmpty: 'Sem tarefas nesta coluna.',
    },
    announcements: {
      statusUpdated: 'Estado da tarefa actualizado neste navegador (demo).',
      taskCreated: 'Nova tarefa criada e sincronizada neste navegador (demo).',
      taskUpdated: 'Tarefa actualizada neste navegador (demo).',
    },
    columns: {
      code: 'Código',
      task: 'Tarefa & Entregável',
      project: 'Projecto',
      assignee: 'Responsável',
      due: 'Prazo',
      priority: 'Prioridade',
      status: 'Estado',
      actions: 'Acções',
    },
    board: {
      regionAria: 'Quadro operacional de tarefas em três colunas',
      columnCountSuffix: 'tarefas',
    },
  },
  editor: {
    createCode: 'OP-03 · NOVA TAREFA (DEMO)',
    editCode: 'OP-03 · EDITAR TAREFA (DEMO)',
    createTitle: 'Registar nova tarefa operacional',
    editTitle: 'Editar tarefa operacional',
    honestNotice:
      'Registo demonstrativo guardado apenas neste navegador (localStorage). Sem envio a servidor.',
    fieldTitle: 'Título da tarefa',
    fieldTitlePlaceholder: 'Ex.: Rever pormenor da cobertura ventilada 1:20',
    fieldDetail: 'Descrição técnica / entregável',
    fieldDetailPlaceholder:
      'Contexto da revisão, peças desenhadas ou critério de validação…',
    fieldProject: 'Projecto associado',
    fieldDepartment: 'Departamento',
    fieldAssignee: 'Colaborador responsável (demo)',
    fieldPriority: 'Prioridade',
    fieldStatus: 'Estado inicial',
    fieldDueDate: 'Data limite (AAAA-MM-DD)',
    fieldReferenceTag: 'Etiqueta técnica (opcional)',
    fieldReferenceTagPlaceholder: 'Ex.: Corte AA · 1:50',
    submitCreate: 'Criar tarefa',
    submitEdit: 'Guardar alterações',
    validationTitleRequired: 'Indique um título para a tarefa.',
    validationDetailRequired: 'Indique uma breve descrição técnica para a tarefa.',
    validationDateInvalid: 'Indique uma data limite válida no formato AAAA-MM-DD.',
    errorFallback: 'Não foi possível guardar a tarefa neste navegador.',
  },
  calendar: {
    pageTitle: 'Calendário — O+A Workspace',
    eyebrow: 'PRANCHA 04 · CALENDÁRIO · MODO DEMO',
    heading: 'Calendário Operacional',
    subtitle:
      'Consolidação cronológica de marcos de projecto, prazos de tarefas e revisões conjuntas Maputo–Milão.',
    viewMonthLabel: 'Vista Mensal',
    viewAgendaLabel: 'Agenda Cronológica',
    viewSwitcherAria: 'Modo de visualização do calendário',
    prevMonthAria: 'Mês anterior',
    nextMonthAria: 'Mês seguinte',
    demoMonthCta: 'Nov 2026 (Demo)',
    todayCta: 'Hoje',
    kindLabels: {
      project_milestone: 'Marco de Projecto',
      task_deadline: 'Prazo de Tarefa',
      studio_review: 'Revisão de Atelier',
    },
    filters: {
      kindsAria: 'Filtrar por tipo de evento',
      departmentLabel: 'Departamento',
      projectLabel: 'Projecto',
      studioBaseLabel: 'Base de Estúdio',
      studioBases: {
        all: 'Todas as bases',
        Maputo: 'Maputo',
        Milão: 'Milão',
      },
    },
    weekdays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    months: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
    detailPanel: {
      selectedDayEyebrow: 'DIA SELECCIONADO',
      allMonthEyebrow: 'EVENTOS DO MÊS',
      eventsCountLabel: (count) =>
        count === 1 ? '1 evento' : `${count} eventos`,
      emptyDayTitle: 'Sem eventos registados para este dia',
      emptyDayBody:
        'Seleccione outro dia assinalado na grelha ou mude para a Agenda Cronológica para ver todos os marcos filtrados.',
      emptyFilterTitle: 'Nenhum evento corresponde aos filtros actuais',
      emptyFilterBody:
        'Limpe os filtros ou navegue para Novembro de 2026 para consultar os marcos e prazos demonstrativos.',
      openLinkLabel: 'Abrir referência',
      studioBasePrefix: 'Base',
    },
  },
};

const en: OperationsDictionary = {
  common: {
    localSavedBadge: 'Saved in this browser (demo)',
    resetFilters: 'Reset filters',
    allOption: 'All',
    clearAction: 'Clear',
    openProjectDossier: 'Open dossier',
    openTask: 'Open task',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    closeDialog: 'Close dialog',
  },
  statuses: {
    pending: 'Pending',
    in_progress: 'In progress',
    completed: 'Completed',
  },
  priorities: {
    high: 'High',
    medium: 'Medium',
    base: 'Base',
  },
  tasks: {
    pageTitle: 'Tasks — O+A Workspace',
    eyebrow: 'PLATE 03 · TASKS · DEMO MODE',
    heading: 'Studio Tasks',
    subtitle:
      'Technical list and operational board synchronized with Studio Desk and Calendar. Changes saved locally in this browser (demo).',
    newTaskCta: 'New task',
    viewListLabel: 'Technical List',
    viewBoardLabel: 'Operational Board',
    viewSwitcherAria: 'Task view mode',
    scopes: {
      my_work: 'My tasks',
      role_focus: 'Role focus',
      all: 'All',
    },
    filters: {
      scopeAria: 'Task scope',
      statusLabel: 'Status',
      priorityLabel: 'Priority',
      departmentLabel: 'Department',
      projectLabel: 'Project',
      searchLabel: 'Search tasks',
      searchPlaceholder: 'Code, title or project…',
    },
    counters: {
      pending: 'Pending',
      inProgress: 'In progress',
      completed: 'Completed',
      showingPrefix: 'Showing',
    },
    actions: {
      start: 'Start',
      complete: 'Complete',
      reopen: 'Reopen',
      movePending: 'Pending',
      moveInProgress: 'In progress',
      moveCompleted: 'Complete',
    },
    spotlight: {
      tag: 'HIGHLIGHTED TASK · DIRECT LINK',
      invalidNotice: 'The task specified in the URL was not found in this demonstration',
      clearAria: 'Clear task spotlight',
    },
    empty: {
      title: 'No tasks match the active filters',
      body: 'Adjust the scope or filters, or create a new demonstrative task linked to a project.',
      columnEmpty: 'No tasks in this column.',
    },
    announcements: {
      statusUpdated: 'Task status updated in this browser (demo).',
      taskCreated: 'New task created and synchronized in this browser (demo).',
      taskUpdated: 'Task updated in this browser (demo).',
    },
    columns: {
      code: 'Code',
      task: 'Task & Deliverable',
      project: 'Project',
      assignee: 'Assignee',
      due: 'Due',
      priority: 'Priority',
      status: 'Status',
      actions: 'Actions',
    },
    board: {
      regionAria: 'Three-column operational task board',
      columnCountSuffix: 'tasks',
    },
  },
  editor: {
    createCode: 'OP-03 · NEW TASK (DEMO)',
    editCode: 'OP-03 · EDIT TASK (DEMO)',
    createTitle: 'Register new operational task',
    editTitle: 'Edit operational task',
    honestNotice:
      'Demonstrative record saved only in this browser (localStorage). Not sent to any server.',
    fieldTitle: 'Task title',
    fieldTitlePlaceholder: 'e.g., Review ventilated roof detail 1:20',
    fieldDetail: 'Technical description / deliverable',
    fieldDetailPlaceholder:
      'Review context, drawing sheets, or validation criteria…',
    fieldProject: 'Linked project',
    fieldDepartment: 'Department',
    fieldAssignee: 'Assigned collaborator (demo)',
    fieldPriority: 'Priority',
    fieldStatus: 'Initial status',
    fieldDueDate: 'Due date (YYYY-MM-DD)',
    fieldReferenceTag: 'Technical tag (optional)',
    fieldReferenceTagPlaceholder: 'e.g., Section AA · 1:50',
    submitCreate: 'Create task',
    submitEdit: 'Save changes',
    validationTitleRequired: 'Please enter a task title.',
    validationDetailRequired: 'Please enter a brief technical description.',
    validationDateInvalid: 'Please enter a valid due date (YYYY-MM-DD).',
    errorFallback: 'Could not save the task in this browser.',
  },
  calendar: {
    pageTitle: 'Calendar — O+A Workspace',
    eyebrow: 'PLATE 04 · CALENDAR · DEMO MODE',
    heading: 'Operational Calendar',
    subtitle:
      'Chronological consolidation of project milestones, task deadlines, and joint Maputo–Milan studio reviews.',
    viewMonthLabel: 'Month View',
    viewAgendaLabel: 'Chronological Agenda',
    viewSwitcherAria: 'Calendar view mode',
    prevMonthAria: 'Previous month',
    nextMonthAria: 'Next month',
    demoMonthCta: 'Nov 2026 (Demo)',
    todayCta: 'Today',
    kindLabels: {
      project_milestone: 'Project Milestone',
      task_deadline: 'Task Deadline',
      studio_review: 'Studio Review',
    },
    filters: {
      kindsAria: 'Filter by event kind',
      departmentLabel: 'Department',
      projectLabel: 'Project',
      studioBaseLabel: 'Studio Base',
      studioBases: {
        all: 'All studio bases',
        Maputo: 'Maputo',
        Milão: 'Milan',
      },
    },
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    detailPanel: {
      selectedDayEyebrow: 'SELECTED DAY',
      allMonthEyebrow: 'MONTH EVENTS',
      eventsCountLabel: (count) =>
        count === 1 ? '1 event' : `${count} events`,
      emptyDayTitle: 'No events scheduled for this day',
      emptyDayBody:
        'Select another marked day on the grid or switch to the Chronological Agenda to browse all filtered milestones.',
      emptyFilterTitle: 'No events match the current filters',
      emptyFilterBody:
        'Clear filters or navigate to November 2026 to view the demonstrative milestones and deadlines.',
      openLinkLabel: 'Open reference',
      studioBasePrefix: 'Base',
    },
  },
};

export const OPERATIONS_I18N: Record<AppLanguage, OperationsDictionary> = {
  pt,
  en,
};
