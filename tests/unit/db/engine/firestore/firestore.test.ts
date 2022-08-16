import { FirestoreEngine } from '@db/engine/firestore/firestore'
import { Engine } from '@db/engine/interfaces'
import { DBException } from '@http-kit/exception/db'
import firebaseAdmin from 'firebase-admin/app'
import firestore from 'firebase-admin/firestore'
import { app } from 'firebase-admin'

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
  let docMock: firestore.DocumentReference
  let batchMock: firestore.WriteBatch
  let batchReultMock: Promise<firestore.WriteResult[]>
  let writeResultMock: Promise<firestore.WriteResult>
  let documentSnapMock: Promise<firestore.DocumentSnapshot>
  beforeEach(() => {
    const mockApp = ({} as unknown) as app.App
    firestoreMock = {
      collection: jest.fn(),
      batch: jest.fn(),
    } as unknown as firestore.Firestore
    const snapMock = {
      docs: [ {
        id: 'data_1',
        data: jest.fn(() => { return { test: 'test' } }),
      } ],
    } as unknown as  Promise<firestore.QuerySnapshot>
    documentSnapMock = {
      exists: true,
      id: 'data_1',
      data: jest.fn(() => { return { test: 'test' } }),
    } as unknown as  Promise<firestore.DocumentSnapshot>
    collectionMock = {
      add: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      get: jest.fn(() => { return snapMock }),
      where: jest.fn(),
      doc: jest.fn(),
    } as unknown as firestore.CollectionReference
    docMock = {
      update: jest.fn(),
      get: jest.fn(() => { return documentSnapMock }),
    } as unknown as firestore.DocumentReference
    batchMock = {
      set: jest.fn(),
      commit: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as firestore.WriteBatch
    batchReultMock = ({ add: jest.fn() } as unknown) as Promise<firestore.WriteResult[]>
    writeResultMock = ({} as unknown) as Promise<firestore.WriteResult>

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
      const expextResult = [ { _id: 'data_1', test: 'test' } ]

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
      expect(collectionMock.where).toHaveBeenCalledTimes(1)
      expect(collectionMock.where).toHaveBeenCalledWith('status', '==', 1)
      expect(collectionMock.orderBy).toHaveBeenCalledTimes(1)
      expect(collectionMock.orderBy).toHaveBeenCalledWith('status', 'asc')
      expect(output).toStrictEqual(expextResult)
    })

    it('should return document data with limit',async () => {
      const expextResult = [ { _id: 'data_1', test: 'test' } ]

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
      expect(collectionMock.where).toHaveBeenCalledTimes(1)
      expect(collectionMock.where).toHaveBeenCalledWith('status', '==', 1)
      expect(collectionMock.orderBy).toHaveBeenCalledTimes(1)
      expect(collectionMock.orderBy).toHaveBeenCalledWith('status', 'asc')
      expect(collectionMock.limit).toHaveBeenCalledTimes(1)
      expect(collectionMock.limit).toHaveBeenCalledWith(1)
      expect(output).toStrictEqual(expextResult)
    })

    it('should throw error when got error', async () => {
      let isThrown = false
      const mockError = new Error()
      jest.spyOn(firestore.getFirestore(), 'collection').mockImplementation(() => {
        throw mockError
      })

      try {
        const firestoreEngine = new FirestoreEngine()
        await firestoreEngine.select({
          status: {
            [ '==' ]: 1,
            order: 'asc',
          },
        }, 'users_test', {
          limit: 1,
        })
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('insert', () => {
    beforeEach(() => {
      jest.spyOn(firestore.getFirestore(), 'batch').mockReturnValue(batchMock)
      jest.spyOn(firestore.getFirestore(), 'collection').mockReturnValue(collectionMock)
      jest.spyOn(collectionMock, 'doc').mockReturnValue(docMock)
      jest.spyOn(batchMock, 'set').mockReturnValue(batchMock)
      jest.spyOn(batchMock, 'commit').mockReturnValue(batchReultMock)
    })

    it('should add data', async () => {
      const firestoreEngine = new FirestoreEngine()
      await firestoreEngine.insert([ { name: 'user-1' } ], 'users_test')

      expect(firestore.getFirestore().batch).toHaveBeenCalledTimes(1)
      expect(firestore.getFirestore().batch).toHaveBeenCalledWith()
      expect(firestore.getFirestore().collection).toHaveBeenCalledTimes(1)
      expect(firestore.getFirestore().collection).toHaveBeenCalledWith('users_test')
      expect(collectionMock.doc).toHaveBeenCalledTimes(1)
      expect(collectionMock.doc).toHaveBeenCalledWith()
      expect(batchMock.set).toHaveBeenCalledTimes(1)
      expect(batchMock.set).toHaveBeenCalledWith(docMock, { name: 'user-1' })
      expect(batchMock.commit).toHaveBeenCalledTimes(1)
      expect(batchMock.commit).toHaveBeenCalledWith()
    })

    it('should add multiple data', async () => {
      const firestoreEngine = new FirestoreEngine()
      await firestoreEngine.insert([ { name: 'user-1' }, { name: 'user-2' } ], 'users_test')

      expect(firestore.getFirestore().batch).toHaveBeenCalledTimes(1)
      expect(firestore.getFirestore().batch).toHaveBeenCalledWith()
      expect(firestore.getFirestore().collection).toHaveBeenCalledTimes(2)
      expect(firestore.getFirestore().collection).toHaveBeenCalledWith('users_test')
      expect(collectionMock.doc).toHaveBeenCalledTimes(2)
      expect(collectionMock.doc).toHaveBeenCalledWith()
      expect(batchMock.set).toHaveBeenCalledTimes(2)
      expect(batchMock.set).toHaveBeenCalledWith(docMock, { name: 'user-1' })
      expect(batchMock.set).toHaveBeenCalledWith(docMock, { name: 'user-2' })
      expect(batchMock.commit).toHaveBeenCalledTimes(1)
      expect(batchMock.commit).toHaveBeenCalledWith()
    })

    it('should add data to referennce document id', async () => {
      const firestoreEngine = new FirestoreEngine()
      await firestoreEngine.insert([ { documentId: 'doc-1',name: 'user-1' } ], 'users_test')

      expect(firestore.getFirestore().batch).toHaveBeenCalledTimes(1)
      expect(firestore.getFirestore().batch).toHaveBeenCalledWith()
      expect(firestore.getFirestore().collection).toHaveBeenCalledTimes(1)
      expect(firestore.getFirestore().collection).toHaveBeenCalledWith('users_test')
      expect(collectionMock.doc).toHaveBeenCalledTimes(1)
      expect(collectionMock.doc).toHaveBeenCalledWith('doc-1')
      expect(batchMock.set).toHaveBeenCalledTimes(1)
      expect(batchMock.set).toHaveBeenCalledWith(docMock, { name: 'user-1' })
      expect(batchMock.commit).toHaveBeenCalledTimes(1)
      expect(batchMock.commit).toHaveBeenCalledWith()
    })

    it('should throw error when got error', async () => {
      let isThrown = false
      const mockError = new Error()
      jest.spyOn(firestore.getFirestore(), 'collection').mockImplementation(() => {
        throw mockError
      })

      try {
        const firestoreEngine = new FirestoreEngine()
        await firestoreEngine.insert([ { documentId: 'doc-1', name: 'user-1' } ], 'users_test')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('getById', () => {
    beforeEach(() => {
      jest.spyOn(firestore.getFirestore(), 'batch').mockReturnValue(batchMock)
      jest.spyOn(firestore.getFirestore(), 'collection').mockReturnValue(collectionMock)
      jest.spyOn(collectionMock, 'doc').mockReturnValue(docMock)
      jest.spyOn(batchMock, 'update').mockReturnValue(batchMock)
      jest.spyOn(batchMock, 'commit').mockReturnValue(batchReultMock)
    })
    it('should return data by id', async () => {
      const firestoreEngine = new FirestoreEngine()
      const response = await firestoreEngine.getById('1', 'users')

      expect(response).toStrictEqual({
        '_id': 'data_1',
        'test': 'test',
      })
      expect(collectionMock.doc).toHaveBeenCalledTimes(1)
      expect(collectionMock.doc).toHaveBeenCalledWith('1')
    })

    it('should return undefined when not found', async () => {
      documentSnapMock = {
        exists: false,
      } as unknown as  Promise<firestore.DocumentSnapshot>
      const firestoreEngine = new FirestoreEngine()
      const response = await firestoreEngine.getById('not-found', 'users')

      expect(response).toBeUndefined()
      expect(collectionMock.doc).toHaveBeenCalledTimes(1)
      expect(collectionMock.doc).toHaveBeenCalledWith('not-found')
    })

    it('should throw error when have no document id', async () => {
      let isThrown = false
      const mockError = new Error()
      jest.spyOn(firestore.getFirestore(), 'collection').mockImplementation(() => {
        throw mockError
      })

      try {
        const firestoreEngine = new FirestoreEngine()
        await await firestoreEngine.getById('1', 'users')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('update', () => {
    beforeEach(() => {
      jest.spyOn(firestore.getFirestore(), 'batch').mockReturnValue(batchMock)
      jest.spyOn(firestore.getFirestore(), 'collection').mockReturnValue(collectionMock)
      jest.spyOn(collectionMock, 'doc').mockReturnValue(docMock)
      jest.spyOn(batchMock, 'update').mockReturnValue(batchMock)
      jest.spyOn(batchMock, 'commit').mockReturnValue(batchReultMock)
    })

    it('should update data on reference document', async () => {
      const firestoreEngine = new FirestoreEngine()
      await firestoreEngine.update(
        [ { name: 'user-1' }, { name: 'user-2' } ],
        [ { documentId: { '==': 'doc-1' } }, { documentId: { '==': 'doc-2' } } ],
        'users_test'
      )

      expect(firestore.getFirestore().batch).toHaveBeenCalledTimes(1)
      expect(firestore.getFirestore().batch).toHaveBeenCalledWith()
      expect(firestore.getFirestore().collection).toHaveBeenCalledTimes(2)
      expect(firestore.getFirestore().collection).toHaveBeenCalledWith('users_test')
      expect(collectionMock.doc).toHaveBeenCalledTimes(2)
      expect(collectionMock.doc).toHaveBeenCalledWith('doc-1')
      expect(collectionMock.doc).toHaveBeenCalledWith('doc-2')
      expect(batchMock.update).toHaveBeenCalledTimes(2)
      expect(batchMock.update).toHaveBeenCalledWith(docMock, { name: 'user-1' })
      expect(batchMock.update).toHaveBeenCalledWith(docMock, { name: 'user-2' })
      expect(batchMock.commit).toHaveBeenCalledTimes(1)
      expect(batchMock.commit).toHaveBeenCalledWith()
    })

    it('should update data on reference multiple document', async () => {
      const firestoreEngine = new FirestoreEngine()
      await firestoreEngine.update(
        [ { name: 'user-1' } ],
        [ { documentId: { 'in': [ 'doc-1', 'doc-2' ] } } ],
        'users_test'
      )

      expect(firestore.getFirestore().batch).toHaveBeenCalledTimes(1)
      expect(firestore.getFirestore().batch).toHaveBeenCalledWith()
      expect(firestore.getFirestore().collection).toHaveBeenCalledTimes(2)
      expect(firestore.getFirestore().collection).toHaveBeenCalledWith('users_test')
      expect(collectionMock.doc).toHaveBeenCalledTimes(2)
      expect(collectionMock.doc).toHaveBeenCalledWith('doc-1')
      expect(collectionMock.doc).toHaveBeenCalledWith('doc-2')
      expect(batchMock.update).toHaveBeenCalledTimes(2)
      expect(batchMock.update).toHaveBeenCalledWith(docMock, { name: 'user-1' })
      expect(batchMock.commit).toHaveBeenCalledTimes(1)
      expect(batchMock.commit).toHaveBeenCalledWith()
    })

    it('should throw error when have no document id', async () => {
      let isThrown = false

      try {
        const firestoreEngine = new FirestoreEngine()
        await firestoreEngine.update([ { name: 'user-1' } ], [], 'users_test')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw error when got error', async () => {
      let isThrown = false
      const mockError = new Error()
      jest.spyOn(firestore.getFirestore(), 'collection').mockImplementation(() => {
        throw mockError
      })

      try {
        const firestoreEngine = new FirestoreEngine()
        await firestoreEngine.update([ { name: 'user-1' } ], [ { documentId: { '==': 'doc-1' } } ], 'users_test')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('updateById', () => {
    it('should update data on referennce document', async () => {
      jest.spyOn(firestore.getFirestore(), 'batch').mockReturnValue(batchMock)
      jest.spyOn(firestore.getFirestore(), 'collection').mockReturnValue(collectionMock)
      jest.spyOn(collectionMock, 'doc').mockReturnValue(docMock)
      jest.spyOn(docMock, 'update').mockReturnValue(writeResultMock)

      const firestoreEngine = new FirestoreEngine()
      await firestoreEngine.updateById({ name: 'user-1' }, 'doc-1', 'users_test')

      expect(firestore.getFirestore().collection).toHaveBeenCalledTimes(1)
      expect(firestore.getFirestore().collection).toHaveBeenCalledWith('users_test')
      expect(collectionMock.doc).toHaveBeenCalledTimes(1)
      expect(collectionMock.doc).toHaveBeenCalledWith('doc-1')
      expect(collectionMock.doc('doc-1').update).toHaveBeenCalledTimes(1)
      expect(collectionMock.doc('doc-1').update).toHaveBeenCalledWith({ name: 'user-1' })
    })

    it('should throw error when got error', async () => {
      let isThrown = false
      const mockError = new Error()
      jest.spyOn(firestore.getFirestore(), 'collection').mockImplementation(() => {
        throw mockError
      })

      try {
        const firestoreEngine = new FirestoreEngine()
        await firestoreEngine.updateById({ name: 'user-1' }, 'doc-1', 'users_test')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('delete', () => {
    beforeEach(() => {
      jest.spyOn(firestore.getFirestore(), 'batch').mockReturnValue(batchMock)
      jest.spyOn(firestore.getFirestore(), 'collection').mockReturnValue(collectionMock)
      jest.spyOn(collectionMock, 'doc').mockReturnValue(docMock)
      jest.spyOn(batchMock, 'delete').mockReturnValue(batchMock)
      jest.spyOn(batchMock, 'commit').mockReturnValue(batchReultMock)
    })

    it('should delete on reference document', async () => {
      const firestoreEngine = new FirestoreEngine()
      await firestoreEngine.delete(
        { documentId: { '==': 'doc-1' } },
        'users_test'
      )

      expect(firestore.getFirestore().batch).toHaveBeenCalledTimes(1)
      expect(firestore.getFirestore().collection).toHaveBeenCalledTimes(1)
      expect(firestore.getFirestore().collection).toHaveBeenCalledWith('users_test')
      expect(collectionMock.doc).toHaveBeenCalledTimes(1)
      expect(collectionMock.doc).toHaveBeenCalledWith('doc-1')
      expect(batchMock.delete).toHaveBeenCalledTimes(1)
      expect(batchMock.commit).toHaveBeenCalledTimes(1)
    })

    it('should delete multiple document', async () => {
      const firestoreEngine = new FirestoreEngine()
      await firestoreEngine.delete(
        { documentId: { 'in': [ 'doc-1', 'doc-2' ] } },
        'users_test'
      )

      expect(firestore.getFirestore().batch).toHaveBeenCalledTimes(1)
      expect(firestore.getFirestore().collection).toHaveBeenCalledTimes(2)
      expect(firestore.getFirestore().collection).toHaveBeenCalledWith('users_test')
      expect(collectionMock.doc).toHaveBeenCalledTimes(2)
      expect(collectionMock.doc).toHaveBeenCalledWith('doc-1')
      expect(collectionMock.doc).toHaveBeenCalledWith('doc-2')
      expect(batchMock.delete).toHaveBeenCalledTimes(2)
      expect(batchMock.commit).toHaveBeenCalledTimes(1)
    })

    it('should throw error when got error', async () => {
      let isThrown = false
      const mockError = new Error()
      jest.spyOn(firestore.getFirestore(), 'collection').mockImplementation(() => {
        throw mockError
      })

      try {
        const firestoreEngine = new FirestoreEngine()
        await firestoreEngine.delete({ documentId: { '==': 'doc-1' } }, 'users_test')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
    })
  })
})
