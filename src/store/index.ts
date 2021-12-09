import { AnswerStore } from './answerStore'
import { GeneratorStore } from './generatorStore'

class Store {
	/**
	 * Manage stored generators
	 */
	generators: GeneratorStore = new GeneratorStore({
		storeFileName: 'generators.json',
	})
	/**
	 * Manage stored answers to generator prompts
	 */
	answers: AnswerStore = new AnswerStore({ storeFileName: 'answers.json' })
}

/*********************EXPORTS**********************/

export const store = new Store()
