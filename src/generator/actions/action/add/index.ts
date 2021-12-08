import ejs from 'ejs'
import isBinaryPath from 'is-binary-path'
import { majo } from 'majo'
import matcher from 'micromatch'
import path from 'path'
import { Grit } from '@/generator'
import { logger } from 'swaglog'
import { getGlobPatterns } from '@/utils/glob'
import { ActionFn } from '../../runAction'
import { DataType } from '@/generator/generatorConfig'

/*********************TYPES**********************/

/** Add files from tempalate directory to the generator output directory */
interface AddAction {
	type: 'add'
	templateDir?: string
	files: string[] | string
	/**  */
	filters?: Record<string, string | boolean | null | undefined>
	/** Transform the template contents with ejs */
	transform?: boolean
	/**
	 * Only transform files matching given minimatch patterns
	 */
	transformInclude?: string | string[]
	/**
	 * Don't transform files matching given minimatch patterns
	 */
	transformExclude?: string | string[]
	/**
	 * Custom data to use in template transformation
	 */
	data?: DataType | ((ctx: Grit) => DataType)
}

/*********************METHODS**********************/

const addAction: ActionFn<AddAction> = async (context, action) => {
	const config = context.opts.config

	const stream = majo()
	stream.source(['!**/node_modules/**'].concat(action.files), {
		baseDir: path.resolve(
			context.generator.path,
			action.templateDir || config.templateDir || 'template'
		),
	})

	if (action.filters) {
		const excludedPatterns = getGlobPatterns(
			action.filters,
			context.answers,
			true
		)

		if (excludedPatterns.length > 0) {
			stream.use(() => {
				const excludedFiles = matcher(stream.fileList, excludedPatterns)
				for (const file of excludedFiles) {
					stream.deleteFile(file)
				}
			})
		}
	}

	const shouldTransform =
		typeof action.transform === 'boolean'
			? action.transform
			: config?.transform !== false
	// use EJS to transform files with action.data variables availiable
	if (shouldTransform) {
		stream.use(({ files }) => {
			let fileList = Object.keys(stream.files)

			// Exclude binary path
			fileList = fileList.filter((fp) => !isBinaryPath(fp))

			// Change transform behavior
			if (action.transformInclude) {
				fileList = matcher(fileList, action.transformInclude)
			}
			if (action.transformExclude) {
				fileList = matcher.not(fileList, action.transformExclude)
			}

			fileList.forEach((relativePath) => {
				const contents = files[relativePath].contents.toString()

				const actionData =
					typeof action.data === 'object'
						? action.data
						: action.data && action.data.call(context, context)
				stream.writeContents(
					relativePath,
					ejs.render(
						contents,
						Object.assign({}, context.answers, actionData, context.data)
					)
				)
			})
		})
	}
	stream.onWrite = (_, targetPath): void => {
		logger.fileAction('magenta', 'Created', targetPath)
	}
	await stream.dest(context.opts.outDir)
}

/*********************EXPORTS**********************/

export { AddAction, addAction }
