import { Answers } from '@/generator/prompts'
import { BaseStore, BaseStoreOptions } from '../baseStore'

/*********************TYPES**********************/

type AnswerStoreOptions = BaseStoreOptions

/*********************METHODS**********************/

class AnswerStore extends BaseStore<Answers> {
	constructor(options?: AnswerStoreOptions) {
		super({ ...options })
	}
}

/*********************EXPORTS**********************/

export { AnswerStore }
