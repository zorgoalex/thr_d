import { type DBSchema, type IDBPDatabase, openDB as idbOpen } from 'idb'

import type { Project, UIState } from '@/types/project'

const DB_NAME = 'thr_d'
const DB_VERSION = 1
const LAST_PROJECT_KEY = 'thr_d_lastProjectId'

interface ThrDDB extends DBSchema {
  projects: { key: string; value: Project }
  ui_state: { key: string; value: UIState & { id: string } }
  app_meta: { key: string; value: { key: string; value: string } }
}

let dbInstance: IDBPDatabase<ThrDDB> | null = null

async function getDB(): Promise<IDBPDatabase<ThrDDB>> {
  if (dbInstance) return dbInstance
  dbInstance = await idbOpen<ThrDDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('ui_state')) {
        db.createObjectStore('ui_state', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('app_meta')) {
        db.createObjectStore('app_meta', { keyPath: 'key' })
      }
    },
  })
  return dbInstance
}

export function isPersistenceAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

export async function saveProject(
  project: Project,
  uiState: UIState,
): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['projects', 'ui_state', 'app_meta'], 'readwrite')
  await tx.objectStore('projects').put(project)
  await tx.objectStore('ui_state').put({ ...uiState, id: project.id })
  await tx.objectStore('app_meta').put({
    key: 'lastProjectId',
    value: project.id,
  })
  await tx.done

  // Fallback: small metadata in localStorage
  try {
    localStorage.setItem(LAST_PROJECT_KEY, project.id)
  } catch {
    // Ignore localStorage failures
  }
}

export async function loadProject(
  id: string,
): Promise<{ project: Project; uiState: UIState } | null> {
  const db = await getDB()
  const project = await db.get('projects', id)
  if (!project) return null
  const uiRecord = await db.get('ui_state', id)
  const uiState: UIState = uiRecord
    ? {
        leftPanelOpen: uiRecord.leftPanelOpen,
        rightPanelOpen: uiRecord.rightPanelOpen,
        activeTab: uiRecord.activeTab,
        cameraMode: (uiRecord as unknown as UIState).cameraMode ?? 'perspective',
      }
    : { leftPanelOpen: true, rightPanelOpen: true, activeTab: 'templates', cameraMode: 'perspective' }
  return { project, uiState }
}

export async function getLastProjectId(): Promise<string | null> {
  try {
    const db = await getDB()
    const meta = await db.get('app_meta', 'lastProjectId')
    if (meta) return meta.value
  } catch {
    // Fallback to localStorage
  }
  try {
    return localStorage.getItem(LAST_PROJECT_KEY)
  } catch {
    return null
  }
}

export async function hasAutosave(): Promise<boolean> {
  const id = await getLastProjectId()
  if (!id) return false
  const db = await getDB()
  const project = await db.get('projects', id)
  return project != null
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['projects', 'ui_state'], 'readwrite')
  await tx.objectStore('projects').delete(id)
  await tx.objectStore('ui_state').delete(id)
  await tx.done
}

/** Reset for testing */
export function resetDBInstance(): void {
  dbInstance = null
}
