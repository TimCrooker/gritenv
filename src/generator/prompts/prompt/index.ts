import { ConfirmPrompt } from './confirm'
import { InputPrompt } from './input'
import { NumberPrompt } from './number'
import { PasswordPrompt } from './password'
import { CheckboxPrompt } from './withChoices/checkbox'
import { ListPrompt } from './withChoices/list'

/*********************TYPES**********************/

type Answers = Record<string, any>

type Answer<T = any> = Record<string, T>

type WithAnswers<T> = T | ((answers: Answers) => T)

type WithFullContext<T, Y> = (input: T, answers: Answers) => Y

type Prompt =
	| ListPrompt
	| ConfirmPrompt
	| NumberPrompt
	| PasswordPrompt
	| CheckboxPrompt
	| InputPrompt

interface BasePrompt {
	type: string
	name: string
	message: WithAnswers<string>
	/** Skips the question when false is returned */
	when?: WithAnswers<boolean>
	prefix?: string
	suffix?: string
	/** Store the answer in cache for next time */
	store?: boolean
}

type ArrayPrompt = ListPrompt | CheckboxPrompt

/*********************EXPORTS**********************/

export { Answers, Answer, WithAnswers, WithFullContext }

export {
	Prompt,
	BasePrompt,
	ArrayPrompt,
	ListPrompt,
	ConfirmPrompt,
	NumberPrompt,
	PasswordPrompt,
	CheckboxPrompt,
	InputPrompt,
}
