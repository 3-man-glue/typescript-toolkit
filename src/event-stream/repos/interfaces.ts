import { PlainObject } from '@utils/common-types'

/* eslint-disable camelcase */
export interface EventState {
  rootId: string
  subjectId: string
  eventId: string
  subject: string
  params: PlainObject
  context: PlainObject
  action: string
  actor: EventActor
  timestamp: Date
  createdAt: Date
}

export type EventActor = {
  id: string
  alias: string
  externalId: string
  role: Role
}

export type Role = {
  externalRole: string
  role: string
}
export interface EventDBState extends PlainObject {
  root_id: string
  subject_id: string
  event_id: string
  subject: string
  params: string
  context: string
  action: string
  actor: {
    id: string
    alias: string
    external_id: string
    role: {
      external_role: string
      role: string
    }
  }
  timestamp: number
  created_at: number
}
