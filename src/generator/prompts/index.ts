import { Grit } from '@/generator'
import { store } from '@/store'
import resolveFrom from 'resolve-from'
import { logger } from 'swaglog'
import { GeneratorConfig } from '../generatorConfig'
import { createPrompt, RemovePromptType } from './createPrompt'
import {
	Answers,
	CheckboxPrompt,
	ConfirmPrompt,
	InputPrompt,
	ListPrompt,
	NumberPrompt,
	PasswordPrompt,
	Prompt,
} from './prompt'
import { runPrompts } from './runPrompts'

/*********************TYPES**********************/

/*********************METHODS**********************/

class Prompts {
	private _prompts: Prompt[] = []
	private grit: Grit
	private _answers: Answers = {}
	private mock: boolean

	constructor(context: Grit) {
		this.grit = context
		this.mock = context.opts.mock || false
	}

	async run(): Promise<void> {
		// Gets prompts from the generator config
		await this.getPrompts()

		// Gets cached answers from the store
		const cachedAnswers = this.getCachedAnswers()

		// Run prompts supplied by the generator
		const answers = await runPrompts({
			prompts: this._prompts,
			cachedAnswers,
			injectedAnswers: this.injectedAnswers,
			mock: this.mock,
		})
		logger.debug(`Retrived answers:`, answers)

		// Cache new answers
		const answersToStore: Answers = {}
		for (const prompt of this._prompts) {
			if (prompt.store) {
				answersToStore[prompt.name] = answers[prompt.name]
			}
		}
		this.setCachedAnswers(answersToStore)

		this._answers = answers
	}

	/** Takes a prompt object and throw an exception if it is not valid */
	private validate(prompt: Prompt, index: number): void {
		if (!prompt.type) {
			throw new Error(`Missing property "type" on prompt # ${index + 1})`)
		}

		if (!prompt.message) {
			throw new Error(
				`Missing property "message" on prompt # (index: ${index})`
			)
		}

		if (!prompt.name) {
			throw new Error(`Missing property "name" on prompt # (index: ${index})`)
		}
	}

	/** Get the list of valid prompts from the generator file */
	private async getPrompts(
		context: Grit = this.grit,
		config: GeneratorConfig['prompts'] = this.grit.opts.config.prompts
	): Promise<void> {
		const promptsArray =
			typeof config === 'function' ? await config.call(this, context) : config

		if (!promptsArray || promptsArray.length === 0) return

		const prompts = [...this._prompts, ...promptsArray]
		for (const prompt of prompts) {
			try {
				this.validate(prompt, prompts.indexOf(prompt))
				this._prompts.push(prompt)
			} catch (error) {
				logger.debug(error)
			}
		}
	}

	/** Get previosly stored answers for the generator */
	private getCachedAnswers(): Answers {
		const cachedAnswers = store.answers.get(this.answersCacheID)
		if (!this.mock) {
			logger.debug('Loaded cached answers:', cachedAnswers)
		}
		return cachedAnswers
	}

	/** set new answers to store in the cache for the generator */
	private setCachedAnswers(answers: Answers): void {
		if (!this.mock) {
			logger.debug('Caching prompt answers:', answers)
			store.answers.set(this.answersCacheID, answers)
		}
	}

	/** Unique id for storing answers in the cache */
	private get answersCacheID(): string {
		const generator = this.grit.generator
		const pkgPath = resolveFrom.silent(generator.path, './package.json')
		const pkgVersion = pkgPath ? require(pkgPath).version : ''
		return `${generator.hash + pkgVersion.replace(/\./g, '\\.')}`
	}

	/**
	 *  answers provided at generator instantiation that will
	 * automatically be used instead of respective prompts
	 */
	private get injectedAnswers(): Answers {
		return (this.grit.opts.answers as Answers) || {}
	}

	/**
	 * Runtime availiable methods
	 */

	/** Add a prompt or an array of prompts to the generator */
	newPrompt(prompt: Prompt | Prompt[]): void {
		const validateAndPush = (prompt: Prompt): void => {
			this.validate(prompt, this._prompts.length)
			this._prompts.push(prompt)
		}

		if (Array.isArray(prompt)) {
			prompt.forEach((prompt) => {
				validateAndPush(prompt)
			})
		} else {
			validateAndPush(prompt)
		}
	}

	input(action: RemovePromptType<InputPrompt>): this {
		this.newPrompt(createPrompt.input(action))
		return this
	}

	password(action: RemovePromptType<PasswordPrompt>): this {
		this.newPrompt(createPrompt.password(action))
		return this
	}

	number(action: RemovePromptType<NumberPrompt>): this {
		this.newPrompt(createPrompt.number(action))
		return this
	}

	confirm(action: RemovePromptType<ConfirmPrompt>): this {
		this.newPrompt(createPrompt.confirm(action))
		return this
	}

	checkbox(action: RemovePromptType<CheckboxPrompt>): this {
		this.newPrompt(createPrompt.checkbox(action))
		return this
	}

	list(action: RemovePromptType<ListPrompt>): this {
		this.newPrompt(createPrompt.list(action))
		return this
	}

	/** Runtime availiable Properties */

	get prompts(): Prompt[] {
		return this._prompts
	}

	get answers(): Answers {
		return this._answers
	}

	set answers(value: Record<string, any>) {
		this._answers = value
	}
}

/*********************EXPORTS**********************/

export { Prompts }

export * from './prompt'
