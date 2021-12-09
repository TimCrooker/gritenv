import { LocalGenerator } from '@/index'
import path from 'path'
import { GeneratorStore } from '.'

// const storePath = path.resolve(__dirname, 'fixtures')
// const generator: LocalGenerator = {
// 	type: 'local',
// 	hash: 'test',
// 	path: 'test',
// }

// let store: GeneratorStore

// describe('Generator Store', () => {
// 	beforeEach(() => {
// 		store = new GeneratorStore({
// 			storePath,
// 		})
// 	})

// 	afterEach(() => {
// 		store.clear()
// 	})

// 	it('set and get answer into store', () => {
// 		store.set('12345678', generator)
// 		expect(store.get('12345678')).toEqual(generator)
// 	})
// })

test('placeholder', (): void => {
	expect(true).toBe(true)
})
