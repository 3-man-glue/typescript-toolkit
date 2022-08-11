import { initializeApp, getApps } from 'firebase-admin/app'
import { InternalServerException } from '@http-kit/exception/internal-server'
import { app } from 'firebase-admin'

export class FirebaseApp {
  public app: app.App

  private readonly FIREBASE_NAME: string

  constructor(firebaseName = 'firebase-app') {
    this.FIREBASE_NAME = firebaseName
    try {
      const apps = getApps() as app.App[]

      const firebaseApp = apps.find((app: app.App) => ( app.name === this.FIREBASE_NAME ))

      if (firebaseApp) {
        this.app = firebaseApp
      } else {
        this.app = initializeApp({}, this.FIREBASE_NAME) as app.App
      }
    } catch (error) {
      throw new InternalServerException('Firebase initial error').withCause(error)
    }
  }
}

import FirebaseAdmin = require('firebase-admin')
import { getAuth } from 'firebase-admin/auth'
export { FirebaseAdmin, getAuth }
