import { toFileRows } from '../../src/modules/files/toFileRows.js'

/** Shaped like what GET /files/data answers: most files arrive with no lines. */
const FILES = [
  { file: 'test1.csv', lines: [] },
  {
    file: 'test3.csv',
    lines: [
      { text: 'g', number: 101382507, hex: '65badd1f29e6235199261cd3026a97f5' },
      { text: 'mwmBQxoeKkxMm', number: 57685292, hex: 'cb6dfa6422d170d2ae99aaf3f99665e4' }
    ]
  },
  { file: 'test2.csv', lines: [] },
  {
    file: 'test9.csv',
    lines: [{ text: 'clnburZYpPQgBiveSSeq', number: 527447, hex: 'b57c543e4d1f0dab7d4353f9dd0db302' }]
  }
]

describe('toFileRows', () => {
  it('turns every line into a row of its own', () => {
    expect(toFileRows(FILES)).toHaveLength(3)
  })

  it('flattens the rows of all the files into a single list, in order', () => {
    expect(toFileRows(FILES).map(({ file }) => file)).toEqual([
      'test3.csv',
      'test3.csv',
      'test9.csv'
    ])
  })

  it('repeats the file name on each row and carries the line over untouched', () => {
    const [first, second] = toFileRows(FILES)

    expect(first).toMatchObject({
      file: 'test3.csv',
      text: 'g',
      number: 101382507,
      hex: '65badd1f29e6235199261cd3026a97f5'
    })
    expect(second).toMatchObject({ file: 'test3.csv', text: 'mwmBQxoeKkxMm', number: 57685292 })
  })

  it('contributes no rows for a file whose lines came empty', () => {
    expect(toFileRows([{ file: 'test1.csv', lines: [] }])).toEqual([])
  })

  it('returns no rows when every file arrived without lines', () => {
    expect(toFileRows([{ file: 'test1.csv', lines: [] }, { file: 'test2.csv', lines: [] }])).toEqual([])
  })

  it('returns no rows for an empty response', () => {
    expect(toFileRows([])).toEqual([])
  })

  it('gives every row a unique id', () => {
    const ids = toFileRows(FILES).map(({ id }) => id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it('builds the id out of the data, never out of the position', () => {
    const ids = toFileRows(FILES).map(({ id }) => id)

    expect(ids).not.toEqual(['0', '1', '2'])
    ids.forEach((id) => expect(id).toContain('.csv'))
  })

  it('keeps the id of a row stable when the files around it change', () => {
    const [target] = toFileRows([FILES[1]])
    const reordered = toFileRows([FILES[3], FILES[0], FILES[1]])

    expect(reordered.map(({ id }) => id)).toContain(target.id)
  })

  it('does not mutate the response it is handed', () => {
    const response = [{ file: 'test3.csv', lines: [{ text: 'g', number: 1, hex: 'abc' }] }]
    const snapshot = JSON.parse(JSON.stringify(response))

    toFileRows(response)

    expect(response).toEqual(snapshot)
  })
})
