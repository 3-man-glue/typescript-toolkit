import Templates from '@utils/reg-exp-templates'

describe('RFC3339 Date Time format template', () => {
  it.each([
    [ '2022-02-07T12:04:03.300+07:00', { date: '2022-02-07', time: 'T12:04:03', ms: '.300', zone: '+07:00' } ],
    [ '2022-02-07T12:04:03.30+07:00', { date: '2022-02-07', time: 'T12:04:03', ms: '.30', zone: '+07:00' } ],
    [ '1996-12-19T16:39:57-08:00', { date: '1996-12-19', time: 'T16:39:57', zone: '-08:00' } ],
    [ '1990-12-31T23:59:60Z', { date: '1990-12-31', time: 'T23:59:60', zone: 'Z' } ],
    [ '1990-12-31T23:59:60.52Z', { date: '1990-12-31', time: 'T23:59:60', ms: '.52', zone: 'Z' } ],
    [ '2022-02-07T12:04:03.300Z', { date: '2022-02-07', time: 'T12:04:03', ms: '.300', zone: 'Z' } ],
    [ '1990-12-31T23:59:60.52Z', { date: '1990-12-31', time: 'T23:59:60', ms: '.52', zone: 'Z' } ],
  ])('should return capture groups when date string is %s', (testValue, expectedGroups) => {
    const groups = Templates.rfc3339DateTime().exec(testValue)?.groups

    expect(groups).toBeDefined()
    expect(groups).toMatchObject(expectedGroups)
  })

  it.each([
    '2022-02-07T12:04:03.300+07:00',
    '2022-02-07T12:04:03.30+07:00',
    '1996-12-19T16:39:57-08:00',
    '1990-12-31T23:59:60Z',
    '1990-12-31T23:59:60.52Z',
    '2022-02-07T12:04:03.300Z',
    '1990-12-31T23:59:60.52Z',
  ])('should validate passed when date string is %s', (testValue) => {
    expect(Templates.rfc3339DateTime().test(testValue)).toBeTruthy()
  })

  it.each([
    '1990-12-31T23:59:60GMT+7',
    '2022-02-07 12:04:03.300+07:00',
    '2022/02/07T12:04:03.300+07:00',
    '2022-02-07',
    '12:04:03',
    '2022-02-07 12:04:03',
  ])('should validate failed when date string is %s', (testValue) => {
    expect(Templates.rfc3339DateTime().test(testValue)).toBeFalsy()
  })
})
