import { AxiosHttpClient } from '@http-kit/client/axios'
import axios from 'axios'
jest.mock('axios')

beforeAll(() => {
  (axios.create as jest.Mock).mockReturnThis()
})

describe('Http Client', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const baseURL = 'localhost:4000'
  const timeout = 1000
  const headers = { authorization: 'xxx' }

  it('should create client with input', () => {
    new AxiosHttpClient(baseURL, timeout, headers)
    expect(axios.create).toHaveBeenLastCalledWith({ baseURL, timeout, headers })
  })

  it('should create client with options', () => {
    new AxiosHttpClient(baseURL, timeout, headers, { httpAgent: 'agent', httpsAgent: 'agents' })
    expect(axios.create).toHaveBeenLastCalledWith({
      baseURL,
      timeout,
      headers,
      httpAgent: 'agent',
      httpsAgent: 'agents',
    })
  })

  describe('GET', () => {
    it('should call get with added headers given call setHeaders', async () => {
      axios.get = jest
        .fn()
        .mockResolvedValue({ data: { id: 1 }, headers: { authorization: 'xxx', test: 1 }, status: 200 })
      const expectedConfig = { params: { status: 1 }, headers: { authorization: 'xxx', test: 1 } }
      const expectedResponse = { data: { id: 1 }, headers: { authorization: 'xxx', test: 1 }, status: 200 }

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers).setHeaders({ test: 1 })
      const response = await axiosClient.get('/users', { status: 1 })

      expect(axios.get).toHaveBeenCalledWith('/users', expectedConfig)
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(response).toStrictEqual(expectedResponse)
    })

    it('should call axios get given query', async () => {
      axios.get = jest.fn().mockResolvedValue({ data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 })
      const expectedConfig = { params: { status: 1 }, headers: { authorization: 'xxx' } }
      const expectedResponse = { data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 }

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)
      const response = await axiosClient.get('/users', { status: 1 })

      expect(axios.get).toHaveBeenCalledWith('/users', expectedConfig)
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(response).toStrictEqual(expectedResponse)
    })

    it('should call axios get given no query', async () => {
      axios.get = jest.fn().mockResolvedValue({ data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 })
      const expectedConfig = { headers, params: {} }
      const expectedResponse = { data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 }

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)
      const response = await axiosClient.get('/users')

      expect(axios.get).toHaveBeenCalledWith('/users', expectedConfig)
      expect(axios.get).toHaveBeenCalledTimes(1)
      expect(response).toStrictEqual(expectedResponse)
    })

    it('should get throw error given promise reject', async () => {
      axios.get = jest.fn().mockRejectedValueOnce(new Error('error-test'))

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)

      await expect(axiosClient.get('/users', { status: 1 })).rejects.toThrowError('error-test')
    })

    it('should get handle error `ECONNREFUSED` given promise reject', async () => {
      axios.get = jest.fn().mockRejectedValueOnce({ code: 'ECONNREFUSED', message: 'ECONNREFUSED' })

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)

      await expect(axiosClient.get('/users', { status: 1 })).rejects.toThrowError('ECONNREFUSED')
    })
  })

  describe('POST', () => {
    it('should call axios post', async () => {
      axios.post = jest.fn().mockResolvedValue({ data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 })
      const expectedResponse = { data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 }
      const expectedConfig = { headers: { authorization: 'xxx' } }

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)
      const response = await axiosClient.post('/users', { id: 2 })

      expect(axios.post).toHaveBeenCalledWith('/users', { id: 2 }, expectedConfig)
      expect(axios.post).toHaveBeenCalledTimes(1)
      expect(response).toStrictEqual(expectedResponse)
    })

    it('should call axios post', async () => {
      axios.post = jest.fn().mockResolvedValue({ data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 })
      const expectedResponse = { data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 }
      const expectedConfig = { headers: { authorization: 'xxx' } }

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)
      const response = await axiosClient.post('/users', { id: 2 })

      expect(axios.post).toHaveBeenCalledWith('/users', { id: 2 }, expectedConfig)
      expect(axios.post).toHaveBeenCalledTimes(1)
      expect(response).toStrictEqual(expectedResponse)
    })

    it('should post throw error given promise reject', async () => {
      axios.post = jest.fn().mockRejectedValueOnce(new Error('error-test'))

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)

      await expect(axiosClient.post('/users', { id: 2 })).rejects.toThrowError('error-test')
    })

    it('should post handle error `ECONNREFUSED` given promise reject', async () => {
      axios.post = jest.fn().mockRejectedValueOnce({ code: 'ECONNREFUSED', message: 'ECONNREFUSED' })

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)

      await expect(axiosClient.post('/users', { id: 2 })).rejects.toThrowError('ECONNREFUSED')
    })
  })

  describe('PUT', () => {
    it('should call axios put', async () => {
      axios.put = jest.fn().mockResolvedValue({ data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 })
      const expectedConfig = { headers: { authorization: 'xxx' } }
      const expectedResponse = { data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 }

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)
      const response = await axiosClient.put('/users', { id: 2 })

      expect(axios.put).toHaveBeenCalledWith('/users', { id: 2 }, expectedConfig)
      expect(axios.put).toHaveBeenCalledTimes(1)
      expect(response).toStrictEqual(expectedResponse)
    })

    it('should put throw error given promise reject', async () => {
      axios.put = jest.fn().mockRejectedValueOnce(new Error('error-test'))

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)

      await expect(axiosClient.put('/users', { id: 2 })).rejects.toThrowError('error-test')
    })

    it('should put handle error `ECONNREFUSED` given promise reject', async () => {
      axios.put = jest.fn().mockRejectedValueOnce({ code: 'ECONNREFUSED', message: 'ECONNREFUSED' })

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)

      await expect(axiosClient.put('/users', { id: 2 })).rejects.toThrowError('ECONNREFUSED')
    })
  })

  describe('DELETE', () => {
    it('should call axios delete', async () => {
      axios.delete = jest.fn().mockResolvedValue({ data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 })
      const expectedConfig = { headers: { authorization: 'xxx' } }
      const expectedResponse = { data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 }

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)
      const response = await axiosClient.delete('/users/1')

      expect(axios.delete).toHaveBeenCalledWith('/users/1', expectedConfig)
      expect(axios.delete).toHaveBeenCalledTimes(1)
      expect(response).toStrictEqual(expectedResponse)
    })

    it('should call axios delete with payload', async () => {
      axios.delete = jest.fn().mockResolvedValue({ data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 })
      const expectedConfig = { headers: { authorization: 'xxx' }, data: { id: 1 } }
      const expectedResponse = { data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 }

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)
      const response = await axiosClient.delete('/users/1', { id: 1 })

      expect(axios.delete).toHaveBeenCalledWith('/users/1', expectedConfig)
      expect(axios.delete).toHaveBeenCalledTimes(1)
      expect(response).toStrictEqual(expectedResponse)
    })

    it('should delete throw error given promise reject', async () => {
      axios.delete = jest.fn().mockRejectedValueOnce(new Error('error-test'))

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)

      await expect(axiosClient.delete('/users')).rejects.toThrowError('error-test')
    })

    it('should delete handle error `ECONNREFUSED` given promise reject', async () => {
      axios.delete = jest.fn().mockRejectedValueOnce({ code: 'ECONNREFUSED', message: 'ECONNREFUSED' })

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)

      await expect(axiosClient.delete('/users')).rejects.toThrowError('ECONNREFUSED')
    })

    it('should delete handle error `ECONNREFUSED` given promise reject', async () => {
      axios.delete = jest.fn().mockRejectedValueOnce({ code: 'ECONNREFUSED', message: 'ECONNREFUSED' })

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)

      await expect(axiosClient.delete('/users')).rejects.toThrowError('ECONNREFUSED')
    })
  })

  describe('PATCH', () => {
    it('should call axios patch', async () => {
      axios.patch = jest.fn().mockResolvedValue({ data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 })
      const expectedConfig = { headers: { authorization: 'xxx' } }
      const expectedResponse = { data: { id: 1 }, headers: { authorization: 'xxx' }, status: 200 }

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)
      const response = await axiosClient.patch('/users', { id: 2 })

      expect(axios.patch).toHaveBeenCalledWith('/users', { id: 2 }, expectedConfig)
      expect(axios.patch).toHaveBeenCalledTimes(1)
      expect(response).toStrictEqual(expectedResponse)
    })

    it('should patch throw error given promise reject', async () => {
      axios.patch = jest.fn().mockRejectedValueOnce(new Error('error-test'))

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)

      await expect(axiosClient.patch('/users', { id: 2 })).rejects.toThrowError('error-test')
    })

    it('should patch handle error `ECONNREFUSED` given promise reject', async () => {
      axios.patch = jest.fn().mockRejectedValueOnce({ code: 'ECONNREFUSED', message: 'ECONNREFUSED' })

      const axiosClient = new AxiosHttpClient(baseURL, timeout, headers)

      await expect(axiosClient.patch('/users', { id: 2 })).rejects.toThrowError('ECONNREFUSED')
    })
  })
})
