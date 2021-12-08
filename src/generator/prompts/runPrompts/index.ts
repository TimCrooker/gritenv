import inquirer from 'inquirer'
import { logger } from 'swaglog'
import { Answers, ArrayPrompt, Prompt } from '../prompt'

/*********************TYPES**********************/

interface PromptOptions {
	prompts: Prompt[]
	cachedAnswers?: Answers
	injectedAnswers?: Answers
	mock?: boolean
}

/*********************METHODS**********************/

/** Use inquirer to get answers to the prompts from the user */
const runPrompts = async ({
	prompts,
	cachedAnswers,
	injectedAnswers = {},
	mock,
}: PromptOptions): Promise<Answers> => {
	if (typeof injectedAnswers === 'string') {
		injectedAnswers = JSON.parse(injectedAnswers)
	}
	logger.debug('Generator injected answers:', injectedAnswers)

	const parsedPrompts: Prompt[] = prompts.map((prompt) => {
		// When mock, use the mock maually provided mock value or the default if it exists
		if (mock) {
			let injectMock: string | number | boolean | string[] | undefined
			if (prompt.mock) injectMock = prompt.mock
			else if (typeof prompt.default !== 'function') {
				injectMock = prompt.default
			}
			if (injectMock && !injectedAnswers[prompt.name])
				injectedAnswers[prompt.name] = injectMock
		}

		return {
			...prompt,
			type: prompt.type,
			name: prompt.name,
			message: prompt.message,
			when(answers) {
				if (mock) return false
				if (typeof prompt.when === 'function') {
					return prompt.when(answers)
				}
				return true
			},
			default(answers) {
				// If we have cached answers, use them to override the defaults before we prompt the username
				if (cachedAnswers && cachedAnswers[prompt.name]) {
					return cachedAnswers[prompt.name]
				}
				if (typeof prompt.default === 'function') {
					return prompt.default(answers)
				}
				return prompt.default
			},
			choices(answers: Answers) {
				const choices = (prompt as ArrayPrompt).choices
				if (typeof choices === 'function') {
					return choices(answers)
				}
				return choices
			},
		} as Prompt
	})

	// if there are injected answers, then automatically answer the prompts included with the injected answers
	const answers: Answers = await inquirer.prompt(parsedPrompts, injectedAnswers)

	return answers
}

/*********************EXPORTS**********************/

export { runPrompts }
