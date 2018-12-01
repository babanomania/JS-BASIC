const terminal = new Terminal( '#terminal', 10 );
let lexer = null;

const clear_btn = document.querySelector('#clear_btn');
clear_btn.addEventListener( 'click', function(event){
    terminal.clear();
});

const run_btn = document.querySelector('#run_btn');
run_btn.addEventListener( 'click', function(event){

    var editor = document.querySelector('#editor');
    if( editor.value ){
        var code_raw = editor.value.toUpperCase();
        editor.value = code_raw;
        console.log( 'raw code is -> ', code_raw );

        lexer = new Lexer( code_raw );
        var tokens = lexer.parse();
        console.log( 'after lexical analysis -> ', tokens );

    }

    

    terminal.print( 'hello1' );
    terminal.print( 'hello2' );
    terminal.print( 'hello3' );
    
    terminal.input( 'what is your name', 'name$', ( name, value ) => {
        console.log( 'input received for var ', name, ' and value ', value );
    });
    
});
