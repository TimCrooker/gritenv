import {
	NpmGenerator,
	ParsedGenerator,
	RepoGenerator,
} from '@/generator/parseGenerator'
import { logger } from 'swaglog'
import { UpdateInfo } from 'update-notifier'
import { BaseStore, BaseStoreOptions } from '../baseStore'
import {
	getNpmGeneratorName,
	getRepoGeneratorName,
} from './utils/getGeneratorName'
import { installGenerator } from './utils/installGenerator'

/*********************TYPES**********************/

/** This represents the data structure of NPM generators as they are stored */
interface StoreNpmGenerator extends NpmGenerator {
	runCount: number
	update?: UpdateInfo
}
/** This represents the data structure of NPM generators as they are stored */
interface StoreRepoGenerator extends RepoGenerator {
	runCount: number
}
/** This union type is the data structure of both storable types of generator as they are in the store*/
type StoreGenerator = StoreNpmGenerator | StoreRepoGenerator
/** This represents the data structure of generators being parsed into a map */
type GroupedGenerators = Map<string, StoreGenerator>

/** Instantiation options for the Generator store class */
type GeneratorStoreOptions = BaseStoreOptions

/*********************METHODS**********************/

/**
 * GeneratorStore class extends BaseStore to provide methods for
 * saving and udpating generators on a users local machine
 */
class GeneratorStore extends BaseStore<StoreGenerator> {
	constructor(options?: GeneratorStoreOptions) {
		super({ ...options })
	}

	/** Add a new generator to the store if it doesn't already exist */
	async add(generator: NpmGenerator | RepoGenerator): Promise<this> {
		if (this.get(generator.hash) !== undefined) {
			throw new Error(`Generator already exists, use the update method instead`)
		}

		logger.debug(`Adding generator`)
		const installedGenerator = await installGenerator(generator)
		this.set(generator.hash, installedGenerator)
		return this
	}

	/** Update generators in the store */
	async update(generator: NpmGenerator | RepoGenerator): Promise<this> {
		if (this.get(generator.hash) === undefined) {
			logger.debug(
				`Generator not found. The update method is for generators that already exist. Adding now...`
			)
			await this.add(generator)
		}

		logger.debug(`Updating generator`)
		const installedGenerator = await installGenerator(generator, true)
		this.set(generator.hash, installedGenerator)
		return this
	}

	/** Remove a generator from the store */
	remove(generator: ParsedGenerator): this {
		this.delete(generator.hash)
		return this
	}

	/**
	 * Search the store for generators matching the current one's name
	 *
	 * @param generator The generator to search for
	 */
	getByName(generator: ParsedGenerator): StoreGenerator | undefined {
		return this.getAllWhere((key, value) => {
			if (generator.type === 'repo' && value.type === 'repo') {
				return (
					`${value.prefix}:${value.user}/${value.repo}` ===
					`${generator.prefix}:${generator.user}/${generator.repo}`
				)
			}
			if (generator.type === 'npm' && value.type === 'npm') {
				return generator.name === value.name
			}
			return false
		})[0]
	}

	/** Group generators by name */
	get generatorNameList(): GroupedGenerators {
		const generatorsMap: GroupedGenerators = new Map()
		this.listify().forEach((generator) => {
			if (generator.type === 'repo') {
				const repoGenerator = generator as StoreRepoGenerator
				const repoGeneratorName = getRepoGeneratorName(repoGenerator)
				if (!generatorsMap.has(repoGeneratorName)) {
					generatorsMap.set(repoGeneratorName, repoGenerator)
				}
			}
			if (generator.type === 'npm') {
				const npmGenerator = generator as StoreNpmGenerator
				const npmGeneratorName = getNpmGeneratorName(npmGenerator)
				if (!generatorsMap.has(npmGeneratorName)) {
					generatorsMap.set(npmGeneratorName, npmGenerator)
				}
			}
		})
		return generatorsMap
	}

	/** Get a list of the names of all generators in the store */
	get npmGeneratorsNames(): string[] {
		return this.listify()
			.filter((g) => g.type === 'npm')
			.map((g) => getNpmGeneratorName(g as StoreNpmGenerator))
	}
}

/*********************EXPORTS**********************/

export { GeneratorStore }

export {
	StoreGenerator,
	StoreNpmGenerator,
	StoreRepoGenerator,
	GroupedGenerators,
}
