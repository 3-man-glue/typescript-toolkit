import { DBException } from '@http-kit/exception/db'
import { QueryOptions } from '@db/engine/generate-query'
import { getSelectQueryConditions, getSelectQueryOrders } from '@db/engine/firestore/generate-query'
import { Condition, FirestoreConditionPattern, OrderPattern } from '@db/interfaces'
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
        throw new DBException(error.message)
      }
    }

    async select<T>(condition: Condition<T>, tableName: string, options?: QueryOptions): Promise<PlainObject[]> {
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

      return snapshot.docs.map((snapshot) => (snapshot.data()))
    }

    public async insert(data: PlainObject[], tableName: string): Promise<void> {
      const docRef = this.firestore.collection(tableName)

      await docRef.add(data)
    }

    public update(_data: PlainObject[], _condition: PlainObject, _tableName: string): Promise<void> {
      throw new NotImplementedException('update method not implemented for Cassandra Adaptor')
    }

    public delete(_condition: PlainObject, _tableName: string): Promise<void> {
      throw new NotImplementedException('delete method not implemented for Cassandra Adaptor')
    }
}
