module.exports = function(grunt) {

    grunt.initConfig({
        watch: {
            jsx: {
                files: [
                    'src/'
                ],
                tasks: ['babel']
            }
        },

        babel: {
            options: {
                presets: ['react']
            },
            jsx: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['**/*.jsx'],
                        dest: 'js',
                        ext: '.js',
                        extDot: 'first'
                    }
                ]
            }
        }
    });

    // Load the plugin that provides the "babel" task.
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('build', ['babel']);

    grunt.registerTask('dev', ['babel', 'watch']);
};
