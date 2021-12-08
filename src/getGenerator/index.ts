import path from 'path'
import JoyCon from 'joycon'
import pa from 'path'
import { logger } from 'swaglog'
import { ensureGenerator } from '@/ensureGenerator'
import {
	ParsedGenerator,
	parseGenerator,
	NpmGenerator,
	RepoGenerator,
} from '@/parseGenerator'
import { defaultGeneratorFile } from '@/defaultGenerator'
import { globalRequire, pathExists } from 'youtill'
import { Grit, GritOptions } from '@/generator'
import { GeneratorConfig } from '@/generatorConfig'
import { CONFIG_FILE_NAME } from '@/config'

const joycon = new JoyCon({
	files: CONFIG_FILE_NAME,
})

/** load the generator config file */
export const loadGeneratorConfig = async (
	cwd: string
): Promise<{ path?: string; data?: GeneratorConfig }> => {
	logger.debug('loading generator from path:', cwd)
	const { path } = await joycon.load({
		cwd,
		stopDir: pa.dirname(cwd),
	})
	const data = path ? await globalRequire(path) : undefined

	return { path, data }
}

/** Check generator has config file */
export const hasGeneratorConfig = (cwd: string): boolean => {
	return Boolean(
		joycon.resolve({
			cwd,
			stopDir: pa.dirname(cwd),
		})
	)
}

/**
 * Load local version of grit for npm packages and local generators
 * if none is found, load the newest version one
 */
export const loadGeneratorGrit = async (
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

interface GetGeneratorOptions
	extends Omit<GritOptions, 'parsedGenerator' | 'config'> {
	generator: ParsedGenerator | string
	update?: boolean
}

/**
 * Get actual generator to run and its config
 *
 * Download it if not yet cached
 */
export const getGenerator = async (
	opts: GetGeneratorOptions
): Promise<Grit> => {
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
		loadedConfig.path && loadedConfig.data
			? loadedConfig.data
			: defaultGeneratorFile

	// load the version of grit from the generator or the newest if it doesn't exist
	const generatorGrit = await loadGeneratorGrit(parsedGenerator)
	const Gen = generatorGrit || Grit

	return new Gen({ ...opts, config: config, generator: parsedGenerator })
}
