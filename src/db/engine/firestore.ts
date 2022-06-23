import { DBException } from '@http-kit/exception/db'
import { QueryOptions  } from '@db/engine/generate-query'
import { Condition } from '@db/interfaces'
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

    async select<T>(_condition: Condition<T>, tableName: string, _options?: QueryOptions): Promise<PlainObject[]> {
      const result: PlainObject[] = []
      const snapshot = await this.firestore
        .collection(tableName)
        .get()

      snapshot.forEach((doc) => {
        result.push(doc.data())
      })

      return result ?? []
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
