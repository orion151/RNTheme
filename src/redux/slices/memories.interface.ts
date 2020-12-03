import { TMemory, TSegment } from '../../types/TMemory'
import { AnnotatedProgress } from '../epics/memory.epic.operators'

export type MemoriesState = {
  memories: TMemory[]
  archives: TMemory[]
  editing: TMemory
  isRefreshingMemories: boolean
  completedMemoryUpload: string | undefined
  failedMemoryUpload: string | undefined
  editingSegment: Omit<TSegment, 'createdAt' | 'id'>
  uploadProgress?: AnnotatedProgress
}
