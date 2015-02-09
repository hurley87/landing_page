module.exports = function(grunt) {

	grunt.initConfig({
		uglify:{
			options: {
				mangle: true, 
				compress: true,
				sourceMap: 'dest/application',
				banner: '/* Davids Grunt File */'
			},
			target: {
				src: 'js/main.js',
				dest: 'js/main.min.js'
			}
		},
		jshint:{
			options: {
				curly: true,
				undef: true,
				unused: true
			},
			target: {
				src: []
			}
		},
		concat: {
			options: {
				seperator: ';'
			},
			source: {
				src: ['js/lib/*.js'],
				dest: ['js/main.js']
			}
		},
		watch: {
			scripts: {
				files: ['**/*.js'],
    			tasks: ['jshint']
			}
		},

		clean: {
			target: ['js/main.min.js']
		},
		wiredep: {
		  task: {
		    src: [
		      'index.html'        
		    ]
		  }
		}
	});

	grunt.loadNpmTasks('grunt-wiredep');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.task.registerTask('default', ['jshint', 'concat', 'uglify']);
	grunt.task.registerTask('reboot', ['clean', 'default']);
};