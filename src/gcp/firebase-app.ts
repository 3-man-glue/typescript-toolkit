import { initializeApp, getApps } from 'firebase-admin/app'
import { InternalServerException } from '@http-kit/exception/internal-server'
import { Service } from 'typedi'
import { app } from 'firebase-admin'

@Service()
export class FirebaseApp {
  public app: app.App

  private readonly FIREBASE_NAME = 'firebase-app'

  constructor() {
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
