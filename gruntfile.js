module.exports = function(grunt) {    
    grunt.initConfig({
       typescript: {
            base: {
                src: ['*.ts','!*.d.ts'],
                dest: './bundle.js',
                options: {
                    module: 'amd', //or commonjs 
                    target: 'es5', //or es3                     
                    sourceMap: true,
                    declaration: true
                }
            }
        },
        typings: {
            install: {}
        }
    });
 
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-typings');
 
    grunt.registerTask('default', ['typings','typescript']);
};