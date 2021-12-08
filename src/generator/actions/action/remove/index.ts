import { getGlobPatterns } from '@/utils/glob'
import { glob, remove } from 'majo'
import { logger } from 'swaglog'
import { ActionFn } from '../../runAction'

/*********************TYPES**********************/

/** Remove files */
interface RemoveAction {
	type: 'remove'
	/** filename(s) to remove */
	files: string | string[] | { [k: string]: string | boolean }
}

/*********************METHODS**********************/

const removeAction: ActionFn<RemoveAction> = async (context, action) => {
	let patterns: string[] = []

	if (typeof action.files === 'string') {
		patterns = [action.files]
	} else if (Array.isArray(action.files)) {
		patterns = action.files
	} else if (typeof action.files === 'object') {
		patterns = getGlobPatterns(action.files, context.data)
	}
	const files = await glob(patterns, {
		cwd: context.opts.outDir,
		absolute: true,
		onlyFiles: false,
	})
	await Promise.all(
		files.map((file) => {
			logger.fileAction('red', 'Removed', file)
			return remove(file)
		})
	)
}

/*********************EXPORTS**********************/

export { RemoveAction, removeAction }
