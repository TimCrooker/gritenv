import { runPrompts } from '../runPrompts'
import { ConfirmPrompt } from './confirm'
import { InputPrompt } from './input/input'
import { NumberPrompt } from './number/number'
import { PasswordPrompt } from './password/password'
import { CheckboxPrompt } from './withChoices/checkbox'
import { ListPrompt } from './withChoices/list'

export type Answers = Record<string, any>

export type Answer<T = any> = Record<string, T>

export type WithAnswers<T> = T | ((answers: Answers) => T)

export type WithFullContext<T, Y> = (input: T, answers: Answers) => Y

export type Prompt =
	| ListPrompt
	| ConfirmPrompt
	| NumberPrompt
	| PasswordPrompt
	| CheckboxPrompt
	| InputPrompt

export interface BasePrompt {
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

export type ArrayPrompt = ListPrompt | CheckboxPrompt

export {
	runPrompts,
	ListPrompt,
	ConfirmPrompt,
	NumberPrompt,
	PasswordPrompt,
	CheckboxPrompt,
	InputPrompt,
}
