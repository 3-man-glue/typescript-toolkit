/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FirestoreEngine } from '@db/engine/firestore/firestore'
import { Engine } from '@db/engine/interfaces'
import { DBException } from '@http-kit/exception/db'
import {
  CollectionReference,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  WriteBatch,
  WriteResult,
  Firestore
} from '@google-cloud/firestore'
import { PlainObject } from '@utils/common-types'

jest.mock('@google-cloud/firestore')

describe('FirestoreEngine', () => {
  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should return Instance of FirestoreEngine', () => {
    const firestoreEngine: Engine = new FirestoreEngine('demo-app')

    expect(firestoreEngine).toBeInstanceOf(FirestoreEngine)
    expect(Firestore).toHaveBeenCalledTimes(1)
    expect(Firestore).toHaveBeenCalledWith({ projectId: 'demo-app' })
  })

  function createMockedDocumentSnapshot(id: string, data?: PlainObject): DocumentSnapshot {
    return { id, data: jest.fn().mockReturnValue(data), exists: !!data } as unknown as DocumentSnapshot
  }

  function createMockedQuerySnapshot(...documents: DocumentSnapshot[]): QuerySnapshot {
    return { docs: documents } as unknown as QuerySnapshot
  }

  describe('select', () => {
    let firestoreEngine: FirestoreEngine
    let query: CollectionReference

    beforeEach(() => {
      firestoreEngine = new FirestoreEngine('demo-app')
      // @ts-ignore - ignored because constructor of CollectionReference is protected but instantiate for test purpose
      query = new CollectionReference()
    })

    it('should query with specified criteria and return document data', async () => {
      const expectedOutput = [
        { _id: 'data_1', test: 'test' },
        { _id: 'data_2', test: 'test' },
      ]
      const snapshot = createMockedQuerySnapshot(
        createMockedDocumentSnapshot('data_1', { test: 'test' }),
        createMockedDocumentSnapshot('data_2', { test: 'test' }),
      )
      jest.spyOn(query, 'where').mockReturnThis()
      jest.spyOn(query, 'orderBy').mockReturnThis()
      jest.spyOn(query, 'get').mockResolvedValue(snapshot)
      jest.spyOn(Firestore.prototype, 'collection').mockReturnValue(query)

      const output = await firestoreEngine.select({ status: { '==': 1, order: 'asc' } }, 'users_test', {})

      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(query.where).toHaveBeenCalledTimes(1)
      expect(query.where).toHaveBeenCalledWith('status', '==', 1)
      expect(query.orderBy).toHaveBeenCalledTimes(1)
      expect(query.orderBy).toHaveBeenCalledWith('status', 'asc')
      expect(output).toStrictEqual(expectedOutput)
    })

    it('should query and limit with specified criteria and return document data', async () => {
      const expectedResult = [ { _id: 'data_1', test: 'test' } ]
      const snapshot = createMockedQuerySnapshot(
        createMockedDocumentSnapshot('data_1', { test: 'test' }),
      )
      jest.spyOn(query, 'where').mockReturnThis()
      jest.spyOn(query, 'orderBy').mockReturnThis()
      jest.spyOn(query, 'limit').mockReturnThis()
      jest.spyOn(query, 'get').mockResolvedValue(snapshot)
      jest.spyOn(Firestore.prototype, 'collection').mockReturnValue(query)

      const output = await firestoreEngine.select(
        { status: { '==': 1, order: 'asc' } },
        'users_test',
        { limit: 1 }
      )

      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(query.where).toHaveBeenCalledTimes(1)
      expect(query.where).toHaveBeenCalledWith('status', '==', 1)
      expect(query.orderBy).toHaveBeenCalledTimes(1)
      expect(query.orderBy).toHaveBeenCalledWith('status', 'asc')
      expect(query.limit).toHaveBeenCalledTimes(1)
      expect(query.limit).toHaveBeenCalledWith(1)
      expect(output).toStrictEqual(expectedResult)
    })

    it('should throw error when unable to fetch snapshot', async () => {
      let isThrown = false
      jest.spyOn(query, 'where').mockReturnThis()
      jest.spyOn(query, 'orderBy').mockReturnThis()
      jest.spyOn(query, 'limit').mockReturnThis()
      jest.spyOn(query, 'get').mockRejectedValue(new Error())
      jest.spyOn(Firestore.prototype, 'collection').mockReturnValue(query)

      try {
        await firestoreEngine.select(
          { status: { '==': 1, order: 'asc' } },
          'users_test',
          { limit: 1 }
        )
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
    })
  })

  describe('insert', () => {
    let firestoreEngine: FirestoreEngine
    let batch: WriteBatch
    let collection: CollectionReference
    let docRef: DocumentReference

    beforeEach(() => {
      firestoreEngine = new FirestoreEngine('demo-app')
      // @ts-ignore - ignored because constructor of WriteBatch is protected but instantiate for test purpose
      batch = new WriteBatch()
      // @ts-ignore - ignored because constructor of CollectionReference is protected but instantiate for test purpose
      collection = new CollectionReference()
      // @ts-ignore - ignored because constructor of DocumentReference is protected but instantiate for test purpose
      docRef = new DocumentReference()
      jest.spyOn(batch, 'set').mockReturnThis()
      jest.spyOn(CollectionReference.prototype, 'doc').mockReturnValue(docRef)
      jest.spyOn(Firestore.prototype, 'collection').mockReturnValue(collection)
      jest.spyOn(Firestore.prototype, 'batch').mockReturnValue(batch)
    })

    it('should add data', async () => {
      jest.spyOn(batch, 'commit').mockResolvedValue([])

      await firestoreEngine.insert([ { name: 'user-1' } ], 'users_test')

      expect(Firestore.prototype.batch).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(collection.doc).toHaveBeenCalledTimes(1)
      expect(batch.set).toHaveBeenCalledTimes(1)
      expect(batch.set).toHaveBeenCalledWith(docRef, { name: 'user-1' })
      expect(batch.commit).toHaveBeenCalledTimes(1)
    })

    it('should add multiple data', async () => {
      jest.spyOn(batch, 'commit').mockResolvedValue([])

      await firestoreEngine.insert([ { name: 'user-1' }, { name: 'user-2' } ], 'users_test')

      expect(Firestore.prototype.batch).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(collection.doc).toHaveBeenCalledTimes(2)
      expect(batch.set).toHaveBeenCalledTimes(2)
      expect(batch.set).toHaveBeenNthCalledWith(1, docRef, { name: 'user-1' })
      expect(batch.set).toHaveBeenNthCalledWith(2, docRef, { name: 'user-2' })
      expect(batch.commit).toHaveBeenCalledTimes(1)
    })

    it('should add data to referennce document id', async () => {
      jest.spyOn(batch, 'commit').mockResolvedValue([])

      await firestoreEngine.insert(
        [ { _id: 'doc-1', name: 'user-1' } ],
        'users_test'
      )

      expect(Firestore.prototype.batch).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(collection.doc).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenCalledWith('doc-1')
      expect(batch.set).toHaveBeenCalledTimes(1)
      expect(batch.set).toHaveBeenCalledWith(docRef, { name: 'user-1' })
      expect(batch.commit).toHaveBeenCalledTimes(1)
      expect(batch.commit).toHaveBeenCalledWith()
    })

    it('should add data to referennce document id mixed', async () => {
      jest.spyOn(batch, 'commit').mockResolvedValue([])

      await firestoreEngine.insert(
        [ { name: 'user-1' }, { _id: 'doc-2', name: 'user-2' }, { name: 'user-3' } ],
        'users_test'
      )

      expect(Firestore.prototype.batch).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(collection.doc).toHaveBeenCalledTimes(3)
      expect(collection.doc).toHaveBeenNthCalledWith(2, 'doc-2')
      expect(batch.set).toHaveBeenCalledTimes(3)
      expect(batch.set).toHaveBeenNthCalledWith(1, docRef, { name: 'user-1' })
      expect(batch.set).toHaveBeenNthCalledWith(2, docRef, { name: 'user-2' })
      expect(batch.set).toHaveBeenNthCalledWith(3, docRef, { name: 'user-3' })
      expect(batch.commit).toHaveBeenCalledTimes(1)
      expect(batch.commit).toHaveBeenCalledWith()
    })

    it('should throw error when got error', async () => {
      let isThrown = false
      jest.spyOn(batch, 'commit').mockRejectedValue(new Error())

      try {
        await firestoreEngine.insert([ { _id: 'doc-1', name: 'user-1' } ], 'users_test')
      } catch (error) {
        isThrown = true

        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
      expect(Firestore.prototype.batch).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(collection.doc).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenCalledWith('doc-1')
      expect(batch.set).toHaveBeenCalledTimes(1)
      expect(batch.set).toHaveBeenCalledWith(docRef, { name: 'user-1' })
      expect(batch.commit).toHaveBeenCalledTimes(1)
    })
  })

  describe('getById', () => {
    let firestoreEngine: FirestoreEngine
    let collection: CollectionReference
    let docRef: DocumentReference

    beforeEach(() => {
      firestoreEngine = new FirestoreEngine('demo-app')
      // @ts-ignore
      collection = new CollectionReference()
      // @ts-ignore
      docRef = new DocumentReference()
      jest.spyOn(collection, 'doc').mockReturnValue(docRef)
      jest.spyOn(Firestore.prototype, 'collection').mockReturnValue(collection)
    })

    it('should return data by id', async () => {
      jest.spyOn(docRef, 'get')
        .mockResolvedValue(createMockedDocumentSnapshot('data_1', { test: 'test' }))

      const response = await firestoreEngine.getById('1', 'users')

      expect(response).toStrictEqual({ '_id': 'data_1', 'test': 'test' })
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users')
      expect(collection.doc).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenCalledWith('1')
      expect(docRef.get).toHaveBeenCalledTimes(1)
    })

    it('should return undefined when not found', async () => {
      jest.spyOn(docRef, 'get')
        .mockResolvedValue(createMockedDocumentSnapshot('data_1'))

      const response = await firestoreEngine.getById('not-found', 'users')

      expect(response).toBeUndefined()
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users')
      expect(collection.doc).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenCalledWith('not-found')
      expect(docRef.get).toHaveBeenCalledTimes(1)
    })

    it('should throw error when have no document id', async () => {
      let isThrown = false
      jest.spyOn(docRef, 'get').mockRejectedValue(new Error())

      try {
        await firestoreEngine.getById('1', 'users')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users')
      expect(collection.doc).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenCalledWith('1')
      expect(docRef.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('update', () => {
    let firestoreEngine: FirestoreEngine
    let collection: CollectionReference
    let batch: WriteBatch

    beforeEach(() => {
      firestoreEngine = new FirestoreEngine('demo-app')
      // @ts-ignore
      collection = new CollectionReference()
      // @ts-ignore
      batch = new WriteBatch()

      jest.spyOn(Firestore.prototype, 'collection').mockReturnValue(collection)
      jest.spyOn(Firestore.prototype, 'batch').mockReturnValue(batch)
    })

    it('should update data on reference document', async () => {
      const dummyDocRef = { id: 'dummy' } as unknown as DocumentReference
      jest.spyOn(collection, 'doc').mockReturnValue(dummyDocRef)

      await firestoreEngine.update(
        [ { name: 'user-1' }, { name: 'user-2' } ],
        [ { documentId: { '==': 'doc-1' } }, { documentId: { '==': 'doc-2' } } ],
        'users_test'
      )

      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(Firestore.prototype.batch).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenCalledTimes(2)
      expect(collection.doc).toHaveBeenNthCalledWith(1, 'doc-1')
      expect(collection.doc).toHaveBeenNthCalledWith(2, 'doc-2')
      expect(batch.update).toHaveBeenCalledTimes(2)
      expect(batch.update).toHaveBeenNthCalledWith(1, dummyDocRef, { name: 'user-1' })
      expect(batch.update).toHaveBeenNthCalledWith(2, dummyDocRef, { name: 'user-2' })
      expect(batch.commit).toHaveBeenCalledTimes(1)
    })

    it('should update data on reference multiple document', async () => {
      const dummyDocRef = { id: 'dummy' } as unknown as DocumentReference
      jest.spyOn(collection, 'doc').mockReturnValue(dummyDocRef)

      await firestoreEngine.update(
        [ { name: 'user-1' } ],
        [ { documentId: { 'in': [ 'doc-1', 'doc-2' ] } } ],
        'users_test'
      )

      expect(Firestore.prototype.batch).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.batch).toHaveBeenCalledWith()
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(collection.doc).toHaveBeenCalledTimes(2)
      expect(collection.doc).toHaveBeenCalledWith('doc-1')
      expect(collection.doc).toHaveBeenCalledWith('doc-2')
      expect(batch.update).toHaveBeenCalledTimes(2)
      expect(batch.update).toHaveBeenNthCalledWith(1, dummyDocRef, { name: 'user-1' })
      expect(batch.update).toHaveBeenNthCalledWith(2, dummyDocRef, { name: 'user-1' })
      expect(batch.commit).toHaveBeenCalledTimes(1)
    })

    it('should throw error when have no document id', async () => {
      let isThrown = false

      try {
        await firestoreEngine.update([ { name: 'user-1' } ], [], 'users_test')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
    })

    it('should throw error when got error', async () => {
      let isThrown = false
      const dummyDocRef = { id: 'dummy' } as unknown as DocumentReference
      jest.spyOn(collection, 'doc').mockReturnValue(dummyDocRef)
      jest.spyOn(batch, 'commit').mockRejectedValue(new Error())

      try {
        await firestoreEngine.update([ { name: 'user-1' } ], [ { documentId: { '==': 'doc-1' } } ], 'users_test')
      } catch (error) {
        isThrown = true

        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(Firestore.prototype.batch).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenNthCalledWith(1, 'doc-1')
      expect(batch.update).toHaveBeenCalledTimes(1)
      expect(batch.update).toHaveBeenNthCalledWith(1, dummyDocRef, { name: 'user-1' })
      expect(batch.commit).toHaveBeenCalledTimes(1)
    })
  })

  describe('updateById', () => {
    let firestoreEngine: FirestoreEngine
    let collection: CollectionReference
    let docRef: DocumentReference

    beforeEach(() => {
      firestoreEngine = new FirestoreEngine('demo-app')
      // @ts-ignore
      collection = new CollectionReference()
      // @ts-ignore
      docRef = new DocumentReference()
      jest.spyOn(collection, 'doc').mockReturnValue(docRef)
      jest.spyOn(Firestore.prototype, 'collection').mockReturnValue(collection)
    })

    it('should update data on referennce document', async () => {
      jest.spyOn(docRef, 'update').mockResolvedValue({} as unknown as WriteResult)

      await firestoreEngine.updateById({ name: 'user-1' }, 'doc-1', 'users_test')

      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(collection.doc).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenCalledWith('doc-1')
      expect(docRef.update).toHaveBeenCalledTimes(1)
      expect(docRef.update).toHaveBeenCalledWith({ name: 'user-1' })
    })

    it('should throw error when got error', async () => {
      let isThrown = false
      jest.spyOn(docRef, 'update').mockRejectedValue(new Error())

      try {
        await firestoreEngine.updateById({ name: 'user-1' }, 'doc-1', 'users_test')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(collection.doc).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenCalledWith('doc-1')
      expect(docRef.update).toHaveBeenCalledTimes(1)
      expect(docRef.update).toHaveBeenCalledWith({ name: 'user-1' })
    })
  })

  describe('delete', () => {
    let firestoreEngine: FirestoreEngine
    let collection: CollectionReference
    let docRef: DocumentReference
    let batch: WriteBatch

    beforeEach(() => {
      firestoreEngine = new FirestoreEngine('demo-app')
      // @ts-ignore
      batch = new WriteBatch()
      // @ts-ignore
      collection = new CollectionReference()
      // @ts-ignore
      docRef = new DocumentReference()

      jest.spyOn(Firestore.prototype, 'batch').mockReturnValue(batch)
      jest.spyOn(Firestore.prototype, 'collection').mockReturnValue(collection)
      jest.spyOn(collection, 'doc').mockReturnValue(docRef)
    })

    it('should delete on reference document', async () => {
      jest.spyOn(batch, 'commit').mockResolvedValue([])

      await firestoreEngine.delete(
        { documentId: { '==': 'doc-1' } },
        'users_test'
      )

      expect(Firestore.prototype.batch).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(collection.doc).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenCalledWith('doc-1')
      expect(batch.delete).toHaveBeenCalledTimes(1)
      expect(batch.delete).toHaveBeenCalledWith(docRef)
      expect(batch.commit).toHaveBeenCalledTimes(1)
    })

    it('should delete multiple document', async () => {
      jest.spyOn(batch, 'commit').mockResolvedValue([])

      await firestoreEngine.delete(
        { documentId: { 'in': [ 'doc-1', 'doc-2' ] } },
        'users_test'
      )

      expect(Firestore.prototype.batch).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(collection.doc).toHaveBeenCalledTimes(2)
      expect(collection.doc).toHaveBeenNthCalledWith(1, 'doc-1')
      expect(collection.doc).toHaveBeenNthCalledWith(2, 'doc-2')
      expect(batch.delete).toHaveBeenCalledTimes(2)
      expect(batch.delete).toHaveBeenNthCalledWith(1, docRef)
      expect(batch.delete).toHaveBeenNthCalledWith(2, docRef)
      expect(batch.commit).toHaveBeenCalledTimes(1)
    })

    it('should throw error when got error', async () => {
      let isThrown = false
      jest.spyOn(batch, 'commit').mockRejectedValue(new Error())

      try {
        await firestoreEngine.delete({ documentId: { '==': 'doc-1' } }, 'users_test')
      } catch (error) {
        isThrown = true
        expect(error).toBeInstanceOf(DBException)
      }

      expect(isThrown).toBeTruthy()
      expect(Firestore.prototype.batch).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('users_test')
      expect(collection.doc).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenCalledWith('doc-1')
      expect(batch.delete).toHaveBeenCalledTimes(1)
      expect(batch.delete).toHaveBeenCalledWith(docRef)
      expect(batch.commit).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteById', () => {
    let firestoreEngine: FirestoreEngine
    let collection: CollectionReference
    let docRef: DocumentReference

    beforeEach(() => {
      firestoreEngine = new FirestoreEngine('demo-app')
      // @ts-ignore
      collection = new CollectionReference()
      // @ts-ignore
      docRef = new DocumentReference()

      jest.spyOn(Firestore.prototype, 'collection').mockReturnValue(collection)
      jest.spyOn(collection, 'doc').mockReturnValue(docRef)
    })

    it('should delete by id properly', async () => {
      jest.spyOn(docRef, 'delete').mockResolvedValue({} as unknown as WriteResult)

      await firestoreEngine.deleteById('doc-id', 'test-table')

      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('test-table')
      expect(collection.doc).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenCalledWith('doc-id')
      expect(docRef.delete).toHaveBeenCalledTimes(1)
    })

    it('should throw error when failed to delete', async () => {
      let isThrown = false
      const fakeError = new Error('fake delete error')
      jest.spyOn(docRef, 'delete').mockRejectedValue(fakeError)

      try {
        await firestoreEngine.deleteById('doc-id', 'test-table')
      } catch (e) {
        isThrown = true

        expect(e).toBeInstanceOf(DBException)
        expect(e.cause).toStrictEqual(fakeError)
        expect(e.input).toStrictEqual({ id: 'doc-id', tableName: 'test-table' })
      }

      expect(isThrown).toBeTruthy()
      expect(Firestore.prototype.collection).toHaveBeenCalledTimes(1)
      expect(Firestore.prototype.collection).toHaveBeenCalledWith('test-table')
      expect(collection.doc).toHaveBeenCalledTimes(1)
      expect(collection.doc).toHaveBeenCalledWith('doc-id')
      expect(docRef.delete).toHaveBeenCalledTimes(1)
    })
  })
})
