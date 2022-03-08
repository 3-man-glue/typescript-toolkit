import { InternalServerException } from '@http-kit/exception/internal-server'
import { FirebaseApp } from '@gcp/firebase-app'
import firebaseAdmin from 'firebase-admin/app'
import { app } from 'firebase-admin'

jest.mock('firebase-admin/app', () => {
  return {
    getApps: jest.fn(),
    initializeApp: jest.fn(),
  }
})

describe('FirebaseApp', () => {
  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should return initialize app with default name', () => {
    const mockApp = ({} as unknown) as app.App
    jest.spyOn(firebaseAdmin, 'getApps').mockReturnValue([])
    jest.spyOn(firebaseAdmin, 'initializeApp').mockReturnValue(mockApp)

    const firebase = new FirebaseApp()

    expect(firebase.app).toStrictEqual(mockApp)
    expect(firebaseAdmin.getApps).toHaveBeenCalledTimes(1)
    expect(firebaseAdmin.initializeApp).toHaveBeenCalledTimes(1)
    expect(firebaseAdmin.initializeApp).toHaveBeenCalledWith({}, 'firebase-app')
  })

  it('should return exist firebase app', () => {
    const mockApp = ({ name: 'test' } as unknown) as app.App
    jest.spyOn(firebaseAdmin, 'getApps').mockReturnValue([ mockApp ])

    const firebase = new FirebaseApp('test')

    expect(firebase.app).toStrictEqual(mockApp)
    expect(firebaseAdmin.getApps).toHaveBeenCalledTimes(1)
  })

  it('should throw error when got error', () => {
    let isThrown = false
    const mockError = new Error()
    jest.spyOn(firebaseAdmin, 'getApps').mockImplementation(() => {
      throw mockError
    })

    try {
      new FirebaseApp('test')
    } catch (error) {
      isThrown = true
      expect(error).toBeInstanceOf(InternalServerException)
    }

    expect(isThrown).toBeTruthy()
  })
})
