import { Grit } from '@/generator'
import { logger } from 'swaglog'
import { Action } from '..'
import {
	addAction,
	modifyAction,
	moveAction,
	copyAction,
	removeAction,
} from '../action'

/*********************TYPES**********************/

type ActionFn<T> = (context: Grit, action: T) => Promise<void>

/*********************METHODS**********************/

const runAction = async (context: Grit, action: Action): Promise<void> => {
	logger.debug('Running action:', action)
	if (action.type === 'add' && action.files) {
		await addAction(context, action)
	} else if (action.type === 'modify' && action.handler) {
		await modifyAction(context, action)
	} else if (action.type === 'move' && action.patterns) {
		await moveAction(context, action)
	} else if (action.type === 'copy' && action.patterns) {
		await copyAction(context, action)
	} else if (action.type === 'remove' && action.files) {
		await removeAction(context, action)
	}
}

/*********************EXPORTS**********************/

export { ActionFn }

export { runAction }
