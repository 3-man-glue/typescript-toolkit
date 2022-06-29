import { FirestoreEngine } from '@db/engine/firestore'
import { Engine } from '@db/engine/interfaces'
import { DBException } from '@http-kit/exception/db'
import firebaseAdmin from 'firebase-admin/app'
import firestore from 'firebase-admin/firestore'
import { app } from 'firebase-admin'
import { NotImplementedException } from '@http-kit/exception/not-implemented'

jest.mock('firebase-admin/app', () => {
  return {
    initializeApp: jest.fn(),
  }
})

jest.mock('firebase-admin/firestore', () => {
  return {
    getFirestore: jest.fn(),
  }
})

describe('FirestoreEngine', () => {
  let firestoreMock: firestore.Firestore
  let collectionMock: firestore.CollectionReference
  let docMock: Promise<firestore.DocumentReference>
  beforeEach(() => {
    const mockApp = ({} as unknown) as app.App
    firestoreMock = {
      collection: jest.fn(),
    } as unknown as firestore.Firestore
    const snapMock = {
      docs: [ {
        data: jest.fn(() => { return { test: 'test' } }),
      } ],
    } as unknown as  Promise<firestore.QuerySnapshot>
    collectionMock = {
      add: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      get: jest.fn(() => { return snapMock }),
      where: jest.fn(),
    } as unknown as firestore.CollectionReference
    docMock = ({} as unknown) as Promise<firestore.DocumentReference>

    jest.spyOn(firebaseAdmin, 'initializeApp').mockReturnValue(mockApp)
    jest.spyOn(firestore, 'getFirestore').mockReturnValue(firestoreMock)
  })

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should return Instance of FirestoreEngine', () => {
    const firestoreEngine: Engine = new FirestoreEngine()

    expect(firestoreEngine).toBeInstanceOf(FirestoreEngine)
    expect(firebaseAdmin.initializeApp).toHaveBeenCalledTimes(1)
    expect(firestore.getFirestore).toHaveBeenCalledTimes(1)
  })

  it('should throw error when got error', () => {
    let isThrown = false
    const mockError = new Error()
    jest.spyOn(firestore, 'getFirestore').mockImplementation(() => {
      throw mockError
    })

    try {
      new FirestoreEngine()
    } catch (error) {
      isThrown = true
      expect(error).toBeInstanceOf(DBException)
    }

    expect(isThrown).toBeTruthy()
  })

  describe('select', () => {
    it('should return document data',async () => {
      const expextResult = [ { test: 'test' } ]

      jest.spyOn(firestore.getFirestore(), 'collection').mockReturnValue(collectionMock)
      jest.spyOn(collectionMock, 'where').mockReturnValue(collectionMock)
      jest.spyOn(collectionMock, 'orderBy').mockReturnValue(collectionMock)

      const firestoreEngine = new FirestoreEngine()
      const output = await firestoreEngine.select({
        status: {
          [ '==' ]: 1,
          order: 'asc',
        },
      }, 'users_test', {})

      expect(firestore.getFirestore().collection).toHaveBeenCalledTimes(1)
      expect(firestore.getFirestore().collection).toHaveBeenCalledWith('users_test')

      const collection = firestore.getFirestore().collection('users_test')

      expect(collection.where).toHaveBeenCalledTimes(1)
      expect(collection.where).toHaveBeenCalledWith('status', '==', 1)
      expect(collection.orderBy).toHaveBeenCalledTimes(1)
      expect(collection.orderBy).toHaveBeenCalledWith('status', 'asc')
      expect(output).toStrictEqual(expextResult)
    })

    it('should return document data with limit',async () => {
      const expextResult = [ { test: 'test' } ]

      jest.spyOn(firestore.getFirestore(), 'collection').mockReturnValue(collectionMock)
      jest.spyOn(collectionMock, 'where').mockReturnValue(collectionMock)
      jest.spyOn(collectionMock, 'orderBy').mockReturnValue(collectionMock)
      jest.spyOn(collectionMock, 'limit').mockReturnValue(collectionMock)

      const firestoreEngine = new FirestoreEngine()
      const output = await firestoreEngine.select({
        status: {
          [ '==' ]: 1,
          order: 'asc',
        },
      }, 'users_test', {
        limit: 1,
      })

      expect(firestore.getFirestore().collection).toHaveBeenCalledTimes(1)
      expect(firestore.getFirestore().collection).toHaveBeenCalledWith('users_test')

      const collection = firestore.getFirestore().collection('users_test')

      expect(collection.where).toHaveBeenCalledTimes(1)
      expect(collection.where).toHaveBeenCalledWith('status', '==', 1)
      expect(collection.orderBy).toHaveBeenCalledTimes(1)
      expect(collection.orderBy).toHaveBeenCalledWith('status', 'asc')
      expect(collection.limit).toHaveBeenCalledTimes(1)
      expect(collection.limit).toHaveBeenCalledWith(1)
      expect(output).toStrictEqual(expextResult)
    })
  })

  describe('insert', () => {
    it('should add data', async () => {
      jest.spyOn(firestore.getFirestore(), 'collection').mockReturnValue(collectionMock)
      jest.spyOn(collectionMock, 'add').mockReturnValue(docMock)

      const firestoreEngine = new FirestoreEngine()
      await firestoreEngine.insert([ {} ], 'users_test')
    })
  })

  describe('update', () => {
    it('should throw Not Implemented Exception when update method is called', async () => {
      const firestoreEngine = new FirestoreEngine()
      let isThrown = false
      try {
        await firestoreEngine.update([], {}, 'table')
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(NotImplementedException)
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('delete', () => {
    it('should throw Not Implemented Exception when delete method is called', async () => {
      const firestoreEngine = new FirestoreEngine()
      let isThrown = false
      try {
        await firestoreEngine.delete({}, 'table')
      } catch (e) {
        isThrown = true
        expect(e).toBeInstanceOf(NotImplementedException)
      }

      expect(isThrown).toBeTruthy()
    })
  })
})
