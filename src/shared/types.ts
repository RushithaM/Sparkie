export interface Reminder {
  id: number
  title: string
  dueAt: string // ISO 8601
  completedAt: string | null
  createdAt: string
}

export interface ReminderInput {
  title: string
  dueAt: string
}

export interface Settings {
  alwaysOnTop: boolean
}

export interface SparkieApi {
  reminders: {
    create(input: ReminderInput): Promise<Reminder>
    update(id: number, patch: Partial<ReminderInput>): Promise<Reminder>
    remove(id: number): Promise<void>
    getUpcoming(): Promise<Reminder[]>
    complete(id: number): Promise<Reminder>
  }
  settings: {
    get(): Promise<Settings>
    set(patch: Partial<Settings>): Promise<Settings>
  }
  onReminderDue(cb: (r: Reminder) => void): () => void
}
