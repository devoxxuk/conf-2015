module.exports = function(grunt) {

    grunt.initConfig({
        watch: {
            jsx: {
                files: [
                    'src/app.jsx'
                ],
                tasks: ['babel']
            }
        },

        babel: {
            options: {
                presets: ['react']
            },
            jsx: {
                files: {
                    'src/app.jsx': 'js/app.js'
                }
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
