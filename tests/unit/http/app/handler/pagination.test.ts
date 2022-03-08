import { PaginationPipe } from '@http-kit/app/handler/pagination'
import { getEmptyContext } from '@http-kit/context/context'
import { PaginationPipeException } from '@http-kit/exception/pagination'

describe('PaginationPipe', () => {
  let paginationPipe: PaginationPipe

  beforeEach(() => {
    paginationPipe = new PaginationPipe()
  })

  it('should throw error when input is invalid', () => {
    let isThrown = false

    try {
      const context = getEmptyContext()
      paginationPipe.setContext(context)

      paginationPipe.handle()
    } catch (error) {
      isThrown = true
      expect(error).toBeInstanceOf(PaginationPipeException)
    }
    expect(isThrown).toBeTruthy()
  })

  it('should return parsed properly when no filters', () => {
    const context = {
      ...getEmptyContext(),
      response: { page: { current: 1, size: 10, total: 2 }, result: [ { id: 1 } ] },
    }
    const expectedResult = {
      current_page: 1,
      filters: null,
      items: [ { id: 1 } ],
      limit: 10,
      total: 2,
    }
    paginationPipe.setContext(context)

    paginationPipe.handle()

    expect(paginationPipe.context.response).toStrictEqual(expectedResult)
  })

  it('should return parsed properly when filters is empty object', () => {
    const context = {
      ...getEmptyContext(),
      response: { page: { current: 1, size: 10, total: 2 }, result: [ { id: 1 } ], filters: {} },
    }
    const expectedResult = {
      current_page: 1,
      filters: null,
      items: [ { id: 1 } ],
      limit: 10,
      total: 2,
    }
    paginationPipe.setContext(context)

    paginationPipe.handle()

    expect(paginationPipe.context.response).toStrictEqual(expectedResult)
  })

  it('should return parsed properly when has filters', () => {
    const context = {
      ...getEmptyContext(),
      response: { filters: { id: '1' }, page: { current: 1, size: 10, total: 2 }, result: [ { id: 1 } ] },
    }
    const expectedResult = {
      current_page: 1,
      filters: { id: '1' },
      items: [ { id: 1 } ],
      limit: 10,
      total: 2,
    }
    paginationPipe.setContext(context)

    paginationPipe.handle()

    expect(paginationPipe.context.response).toStrictEqual(expectedResult)
  })
})
