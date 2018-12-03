const terminal = new Terminal( '#terminal', 10 );
const lexer = new Lexer();

const clear_btn = document.querySelector('#clear_btn');
clear_btn.addEventListener( 'click', function(event){
    terminal.clear();
});

const run_btn = document.querySelector('#run_btn');
run_btn.addEventListener( 'click', function(event){

    var editor = document.querySelector('#editor');
    if( editor.value ){

        var code_lines = lexer.cleanup( editor.value );
        console.log( '1. Raw Code' );
        console.table( code_lines );
        console.log();

        var tokens = lexer.parse( code_lines );
        console.log( '2. After Lexical analysis' );
        console.table( tokens );
        console.log();


    }

    terminal.print( 'HELLO WORLD' );
    terminal.print( 'WHAT IS YOUR NAME ? SHOUVIK' );
    terminal.print( 'HELLO SHOUVIK' );

    terminal.input( 'what is your name', 'name$', ( name, value ) => {
        console.log( 'input received for var ', name, ' and value ', value );
    });

});

var test_code = " ( A + B ) > C  AND B > D";

expr_lexer = new ExprLexer();
test_tokens = expr_lexer.test( test_code.trim() );
console.log( "test -> tokens after lexing" );
console.log( test_tokens );

expr_parser = new ExprParser();
text_opcodes = expr_parser.test( test_tokens );
console.log( "test -> opcodes after parsing" );
console.table( text_opcodes );

