import { Answers } from '@/generator/prompts'
import path from 'path'
import { AnswerStore } from '.'

const storePath = path.resolve(__dirname, 'fixtures')
const answer: Answers = {
	name: 'test',
	value: 'test',
}

let store: AnswerStore

describe('Answer Store', () => {
	beforeEach(() => {
		store = new AnswerStore({
			storePath,
		})
	})

	afterEach(() => {
		store.clear()
	})

	it('set and get answer into store', () => {
		store.set('12345678', answer)
		expect(store.get('12345678')).toEqual(answer)
	})
})
