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

expr_lexer = new ExprLexer();
console.log( "AST for expressions => ", expr_lexer.test() );
