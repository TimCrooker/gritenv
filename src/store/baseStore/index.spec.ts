import { readFileSync } from 'fs'
import path from 'path'
import { pathExistsSync } from 'youtill'
import { BaseStore, BaseStoreOptions } from '.'

type TestItem = {
	name: string
	description: string
}

class BaseTestStore extends BaseStore<TestItem> {
	constructor(opts: BaseStoreOptions) {
		super(opts)
	}
}

const storePath = path.resolve(__dirname, 'fixtures')
const item = {
	type: 'local',
	path: 'test',
	hash: 'test',
}

let store: BaseTestStore

describe('Base Store', () => {
	beforeEach(() => {
		store = new BaseTestStore({
			storePath,
		})
	})

	afterEach(() => {
		store.clear()
	})

	it('set generator into store', () => {
		store.set('12345678', item)
		expect(store.get('12345678')).toEqual(item)
	})

	it('read store', () => {
		const content = store.read()
		expect(content).toEqual({})
	})

	it('backup the store.json file', () => {
		store.set('12345678', item)

		store.backup()

		const content = JSON.parse(
			readFileSync(path.resolve(store.storePath, 'backup.json'), 'utf8')
		)

		expect(content).toEqual({
			'12345678': item,
		})
	})

	it('Restore from backup', () => {
		store.set('12345678', item)
		expect(store.get('12345678')).toEqual(item)

		store.backup()

		store.set('12345678', { ...item, name: 'test2' })
		expect(store.get('12345678')).toEqual({ ...item, name: 'test2' })

		store.restoreFromBackup()

		expect(store.get('12345678')).toEqual(item)

		expect(pathExistsSync(path.resolve(store.storePath, 'backup.json'))).toBe(
			false
		)
	})

	it('clear store', () => {
		store.set('12345678', item)
		expect(store.get('12345678')).toEqual(item)

		store.clear()

		expect(store.get('12345678')).toBeUndefined()
		expect(pathExistsSync(path.resolve(store.storePath, 'backup.json'))).toBe(
			true
		)
	})
})
