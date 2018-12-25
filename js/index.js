const terminal = new Terminal( '#terminal', 10 );
const lexer = new Lexer();
const parser = new Parser();
const runtime = new Runtime( terminal );

const clear_btn = document.querySelector('#clear_btn');
clear_btn.addEventListener( 'click', function(event){
    runtime.clear();

    var error = document.querySelector('#error');
    error.innerHTML = '';
    error.style.display = 'none';
    
});

const run_btn = document.querySelector('#run_btn');
run_btn.addEventListener( 'click', function(event){

    var error = document.querySelector('#error');
    error.innerHTML = '';
    error.style.display = 'none';

    var editor = document.querySelector('#editor');
    if( editor.value ){

        try {

            var code_lines = lexer.cleanup( editor.value );
            console.log( '1. Raw Code' );
            console.table( code_lines );
            console.log();

            var tokens = lexer.parse( code_lines );
            console.log( '2. After Lexical analysis' );
            console.table( tokens );
            console.log( tokens );
            console.log();

            var op_codes = parser.parse( tokens );
            console.log( '3. After Parsing' );
            console.table( op_codes );
            console.log();

            console.log( '4. Executing OpCodes' );
            runtime.upload_opcodes( op_codes );
            runtime.execute();

            /*
            terminal.print( 'HELLO WORLD' );
            terminal.print( 'WHAT IS YOUR NAME ? SHOUVIK' );
            terminal.print( 'HELLO SHOUVIK' );
            terminal.input( 'what is your name', 'name$', 10, this, ( name, value, line_num, instance ) => {
                console.log( 'input received for var ', name, ' and value ', value );
            });
            */

        } catch(err){
            console.error( err );
            var error = document.querySelector('#error');
            error.style.display = 'block';
            error.innerHTML = err;
        }
    }

});


