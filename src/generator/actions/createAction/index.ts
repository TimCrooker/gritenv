import { Action } from '..'
import {
	AddAction,
	MoveAction,
	CopyAction,
	ModifyAction,
	RemoveAction,
} from '../action'

/*********************TYPES**********************/

type RemoveActionType<T extends Action> = Omit<T, 'type'>

/*********************METHODS**********************/

/** Simple type-safe creation of actions */
const createAction = {
	add(action: RemoveActionType<AddAction>): AddAction {
		return {
			...action,
			type: 'add',
		}
	},

	move(action: RemoveActionType<MoveAction>): MoveAction {
		return {
			...action,
			type: 'move',
		}
	},

	copy(action: RemoveActionType<CopyAction>): CopyAction {
		return {
			...action,
			type: 'copy',
		}
	},

	modify(action: RemoveActionType<ModifyAction>): ModifyAction {
		return {
			...action,
			type: 'modify',
		}
	},

	remove(action: RemoveActionType<RemoveAction>): RemoveAction {
		return {
			...action,
			type: 'remove',
		}
	},
}

/*********************EXPORTS**********************/

export { RemoveActionType }

export { createAction }
