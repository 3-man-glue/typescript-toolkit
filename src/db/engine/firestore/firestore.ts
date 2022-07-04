import { DBException } from '@http-kit/exception/db'
import { QueryOptions } from '@db/engine/generate-query'
import { getSelectQueryConditions, getSelectQueryOrders, getDocumentIds } from '@db/engine/firestore/generate-query'
import {
  Condition,
  FirestoreConditionPattern,
  OrderPattern,
  FirestorePayload
} from '@db/interfaces'
import { Engine as EngineInterface } from '@db/engine/interfaces'
import { PlainObject } from '@utils/common-types'
import { NotImplementedException } from '@http-kit/exception/not-implemented'
import { app, firestore } from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp } from 'firebase-admin/app'

export class FirestoreEngine implements EngineInterface {
    private readonly firestore: firestore.Firestore

    constructor() {
      try {
        const app = initializeApp() as app.App
        this.firestore = getFirestore(app) as firestore.Firestore
      } catch (error) {
        throw new DBException(error.message).withCause(error)
      }
    }

    async select<T>(condition: Condition<T>, tableName: string, options?: QueryOptions): Promise<PlainObject[]> {
      try {
        let query = this.firestore.collection(tableName)
        const conditionParams = getSelectQueryConditions(condition)
        const oderParams = getSelectQueryOrders(condition)

        if (conditionParams.length > 0) {
          conditionParams.forEach((param: FirestoreConditionPattern) => {
            query = query.where(param.key, param.operation, param.val) as firestore.CollectionReference
          })
        }

        if (oderParams.length > 0) {
          oderParams.forEach((param: OrderPattern) => {
            query = query.orderBy(param.key, param.val) as firestore.CollectionReference
          })
        }

        if (options?.limit) {
          query = query.limit(options?.limit) as firestore.CollectionReference
        }

        const snapshot = await query.get()

        return snapshot.docs.map((snapshot) => (Object.assign({ _id: snapshot.id }, snapshot.data())))
      } catch (error) {
        throw new DBException(error.message).withCause(error).withInput({ condition, tableName })
      }
    }

    public async insert(data: PlainObject[], tableName: string): Promise<void> {
      try {
        const batch = this.firestore.batch()

        data.forEach((docData) => {
          const { documentId, ...rest } = docData as FirestorePayload
          const ref = this.firestore.collection(tableName)

          if (documentId) {
            batch.set(ref.doc(documentId), rest)
          } else {
            batch.set(ref.doc(), rest)
          }
        })

        await batch.commit()
      } catch (error) {
        throw new DBException(error.message).withCause(error).withInput({ data, tableName })
      }
    }

    public async update<T>(data: PlainObject[], condition: Condition<T>[], tableName: string): Promise<void> {
      try {
        const batch = this.firestore.batch()

        data.forEach((payload, key) => {
          const documentIds = getDocumentIds(condition[key] ?? [])

          documentIds.forEach((documentId) => {
            const ref = this.firestore.collection(tableName)
            batch.update(ref.doc(documentId), payload)
          })
        })

        await batch.commit()
      } catch (error) {
        throw new DBException(error.message).withCause(error).withInput({ data, condition, tableName })
      }
    }

    public async updateById(data: PlainObject, documentId: string, tableName: string): Promise<void> {
      try {
        await this.firestore.collection(tableName).doc(documentId).update(data)
      } catch (error) {
        throw new DBException(error.message).withCause(error).withInput({ data, documentId, tableName })
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public delete(_condition: PlainObject, _tableName: string): Promise<void> {
      throw new NotImplementedException('delete method not implemented for Firestore Adaptor')
    }
}
