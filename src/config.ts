import path from 'path'
import os from 'os'
import { getGitUser } from './utils/git-user'

// URLs
export const DOCS_URL = 'https://timcrooker.github.io/Grit/'
export const GITHUB_URL = 'https://github.com/TimCrooker/Grit'

// Store configs
const STORE_VERSION = 1
export const ROOT_CACHE_PATH = path.join(
	os.homedir(),
	`.grit/V${STORE_VERSION}`
)
export const GENERATORS_CACHE_PATH = path.join(ROOT_CACHE_PATH, 'generators')
export const PACKAGES_CACHE_PATH = path.join(GENERATORS_CACHE_PATH, 'packages')
export const REPOS_CACHE_PATH = path.join(GENERATORS_CACHE_PATH, 'repos')

// Local path conversions
const RE = /^[./]|(^[a-zA-Z]:)/
export const isLocalPath = (v: string): boolean => RE.test(v)
export const removeLocalPathPrefix = (v: string): string => v.replace(RE, '')

// Local Users git info
const gitUser = getGitUser()
export const UserFullName = gitUser.name
export const UserFirstName = UserFullName.split(' ')[0] || 'User'
export const Username = gitUser.username || 'User'

// Plugin configs
export const PLUGIN_MERGE_FILES = ['package.json', 'tsconfig.json', '.babelrc']

// Config file options
export const CONFIG_FILE_NAME = [
	'grit.config.js',
	'grit.config.ts',
	'generator.ts',
	'generator.js',
]

export const PLUGIN_FILE_NAME = [
	'grit.plugin.js',
	'grit.plugin.ts',
	'pluginfile.js',
	'pluginfile.ts',
	'pluginFile.ts',
	'pluginFile.js',
]
