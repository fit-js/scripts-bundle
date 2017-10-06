import path from 'path';
import { obj as thru } from 'through2';

// import del from 'del';
import vfs from 'vinyl-fs';
import gulpPlumber from 'gulp-plumber';
import gulpBabel from 'gulp-babel';
import gulpUglify from 'gulp-uglify';
import babelArrowPlugin from 'babel-plugin-transform-es2015-arrow-functions';
import * as pkg from './package.json';

let develop, output, source, cwd;

export function init (config, core) {
	develop = core.args.env() === 'develop';

	source = config.source || '**/*.js';
	output = config.output;
	cwd = config.cwd ? path.join (process.cwd(), config.cwd) : process.cwd();

	if (!output || !cwd) {
		core.utils.error (pkg.name, 'config.output & config.cwd are required');
		return;
	}

	build();

	let bs = core.globals.get('bs');

	if (develop && bs) {

		bs.watch (source, {
			ignoreInitial: true, cwd
		})
			.on ('add', build)
			.on ('change', build);
	}

	return;
}

function build () {

	return vfs.src (source, {
		sourcemaps: develop, cwd
	})
		.pipe (gulpPlumber())
		.pipe (gulpBabel ({
			plugins: [ babelArrowPlugin ]
		}))
		.pipe (develop ? thru() : gulpUglify())
		.pipe (vfs.dest (output, {
			sourcemaps: develop ? '.' : false
		}));
}
