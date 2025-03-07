import { DBException } from '@http-kit/exception/db'
import { QueryOptions } from '@db/engine/generate-query'
import { getSelectQueryConditions, getSelectQueryOrders, getDocumentIds } from '@db/engine/firestore/generate-query'
import { Condition, FirestoreConditionPattern, OrderPattern } from '@db/interfaces'
import { FirestoreDataObject, FirestoreEngineInterface } from '@db/engine/interfaces'
import { Firestore, Query } from '@google-cloud/firestore'

export class FirestoreEngine implements FirestoreEngineInterface {
  public readonly firestore: Firestore

  constructor(gcpProjectId: string) {
    try {
      this.firestore = new Firestore({ projectId: gcpProjectId })
    } catch (error) {
      throw new DBException(error.message).withCause(error)
    }
  }

  public async getById(id: string, tableName: string): Promise<FirestoreDataObject | undefined> {
    try {
      const snapshot = await this.firestore.collection(tableName).doc(id).get()

      if (!snapshot.exists) {
        return undefined
      }

      return Object.assign({ _id: snapshot.id }, snapshot.data())
    } catch (error) {
      throw new DBException(error.message).withCause(error).withInput({ id })
    }
  }

  async select<T>(condition: Condition<T>, tableName: string, options?: QueryOptions): Promise<FirestoreDataObject[]> {
    try {
      let query: Query = this.firestore.collection(tableName)
      const conditionParams = getSelectQueryConditions(condition)
      const oderParams = getSelectQueryOrders(condition)

      if (conditionParams.length > 0) {
        conditionParams.forEach((param: FirestoreConditionPattern) => {
          query = query.where(param.key, param.operation, param.val)
        })
      }

      if (oderParams.length > 0) {
        oderParams.forEach((param: OrderPattern) => {
          query = query.orderBy(param.key, param.val)
        })
      }

      if (options?.limit) {
        query = query.limit(options?.limit)
      }

      const snapshot = await query.get()

      return snapshot.docs.map((snapshot) => Object.assign({ _id: snapshot.id }, snapshot.data()))
    } catch (error) {
      throw new DBException(error.message).withCause(error).withInput({ condition, tableName })
    }
  }

  public async insert(data: FirestoreDataObject[], tableName: string): Promise<void> {
    try {
      const batch = this.firestore.batch()
      const collection = this.firestore.collection(tableName)
      data.forEach(({ _id, ...data }) => batch.set(_id ? collection.doc(_id) : collection.doc(), data))

      await batch.commit()
    } catch (error) {
      throw new DBException(error.message).withCause(error).withInput({ data, tableName })
    }
  }

  public async update<T>(data: FirestoreDataObject[], condition: Condition<T>[], tableName: string): Promise<void> {
    try {
      const batch = this.firestore.batch()
      const collection = this.firestore.collection(tableName)

      data.forEach((payload, key) => {
        const documentIds = getDocumentIds(condition[key] ?? [])

        documentIds.forEach((documentId) => {
          batch.set(collection.doc(documentId), payload, { merge: true })
        })
      })

      await batch.commit()
    } catch (error) {
      throw new DBException(error.message).withCause(error).withInput({ data, condition, tableName })
    }
  }

  public async updateById(
    data: Omit<FirestoreDataObject, '_id'>,
    documentId: string,
    tableName: string,
  ): Promise<void> {
    try {
      await this.firestore.collection(tableName).doc(documentId).set(data, { merge: true })
    } catch (error) {
      throw new DBException(error.message).withCause(error).withInput({ data, documentId, tableName })
    }
  }

  public async delete<T>(condition: Condition<T>, tableName: string): Promise<void> {
    try {
      const batch = this.firestore.batch()
      const documentIds = getDocumentIds(condition)
      const collection = this.firestore.collection(tableName)
      documentIds.forEach((documentId) => batch.delete(collection.doc(documentId)))

      await batch.commit()
    } catch (error) {
      throw new DBException(error.message).withCause(error).withInput({ condition, tableName })
    }
  }

  public async deleteById(id: string, tableName: string): Promise<void> {
    try {
      await this.firestore.collection(tableName).doc(id).delete()
    } catch (error) {
      throw new DBException(error.message).withCause(error).withInput({ id, tableName })
    }
  }
}