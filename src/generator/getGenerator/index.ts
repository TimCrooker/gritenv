import { CONFIG_FILE_NAME } from '@/config'
import JoyCon from 'joycon'
import path from 'path'
import { logger } from 'swaglog'
import { globalRequire, pathExists } from 'youtill'
import { Grit, GritOptions } from '..'
import { defaultGeneratorFile } from '../defaultGenerator'
import { ensureGenerator } from '../ensureGenerator'
import { GeneratorConfig } from '../generatorConfig'
import {
	NpmGenerator,
	ParsedGenerator,
	parseGenerator,
	RepoGenerator,
} from '../parseGenerator'

/*********************TYPES**********************/

interface GetGeneratorOptions
	extends Omit<GritOptions, 'parsedGenerator' | 'config'> {
	generator: ParsedGenerator | string
	update?: boolean
}

/*********************METHODS**********************/

const joycon = new JoyCon({
	files: CONFIG_FILE_NAME,
})

/** load the generator config file */
const loadGeneratorConfig = async (
	cwd: string
): Promise<{ filePath?: string; data?: GeneratorConfig }> => {
	logger.debug('loading generator from path:', cwd)
	const { path: filePath } = await joycon.load({
		cwd,
		stopDir: path.dirname(cwd),
	})
	const data = filePath ? await globalRequire(filePath) : undefined

	return { filePath, data }
}

/** Check generator has config file */
const hasGeneratorConfig = (cwd: string): boolean => {
	return Boolean(
		joycon.resolve({
			cwd,
			stopDir: path.dirname(cwd),
		})
	)
}

/**
 * Load local version of grit for npm packages and local generators
 * if none is found, load the newest version one
 */
const loadGeneratorGrit = async (
	generator: ParsedGenerator
): Promise<typeof Grit> => {
	//load the generators installed version of grit generator
	let gritPath = path.resolve(generator.path, '../gritenv/dist/index.js')

	if (generator.type === 'local') {
		gritPath = path.resolve(
			generator.path,
			'node_modules/gritenv/dist/index.js'
		)
	}

	// if gritPath is valid then import it and return the grit object
	if (await pathExists(gritPath)) {
		const { Grit } = await import(gritPath)
		return Grit
	}

	return Grit
}

/**
 * Get actual generator to run and its config
 *
 * Download it if not yet cached
 */
const getGenerator = async (opts: GetGeneratorOptions): Promise<Grit> => {
	let parsedGenerator: ParsedGenerator
	// use directly passed parsed generator or parse generator string
	if (typeof opts.generator === 'string') {
		parsedGenerator = parseGenerator(opts.generator as string)
	} else {
		parsedGenerator = opts.generator as NpmGenerator | RepoGenerator
	}

	await ensureGenerator(parsedGenerator, opts.update)

	// load actual generator from generator path
	const loadedConfig = await loadGeneratorConfig(parsedGenerator.path)
	const config: GeneratorConfig =
		loadedConfig.filePath && loadedConfig.data
			? loadedConfig.data
			: defaultGeneratorFile

	// load the version of grit from the generator or the newest if it doesn't exist
	const generatorGrit = await loadGeneratorGrit(parsedGenerator)
	const Gen = generatorGrit || Grit

	return new Gen({ ...opts, config: config, generator: parsedGenerator })
}

/*********************EXPORTS**********************/

export { loadGeneratorConfig, hasGeneratorConfig, loadGeneratorGrit }

export { getGenerator }
