class Runtime{

    constructor( terminal ){
        this.variable_stack = [];
        this.variable_defs = {};
        this.program_counter = 0;
        this.terminal = terminal;
    }

    upload_opcodes( op_codes ){
        this.op_codes = op_codes;
    }

    clear(){
        this.variable_stack = [];
        this.variable_defs = {};
        this.program_counter = 0;
    }

    execute(){

        var callback_maps = {
            'PUSH_NUM': null,
            'PUSH_STR': null,
            'DEFVAR_NUM': null,
            'DEFVAR_STR': null,
            'SETVAR_NUM': null,
            'SETVAR_STR': null,
            'PRINT': this.exec_print,
            'PRINT_NEWLINE': this.exec_print_newline,
            'INPUT': null,
            'OP_GT': null,
            'OP_LT': null,
            'OP_OR': null,
            'OP_AND': null,
            'OP_DIV': null,
            'OP_MUL': null,
            'OP_ADD': null,
            'OP_SUBT': null,
            'CALL_ABS': null, 
            'CALL_ATN': null, 
            'CALL_COS': null, 
            'CALL_EXP': null, 
            'CALL_INT': null, 
            'CALL_LOG': null, 
            'CALL_RND': null, 
            'CALL_SIN': null, 
            'CALL_SQR': null, 
            'CALL_TAN': null, 
            'CALL_CLS': null,
            'END': null,
        };

        var loop_breakers = [
            'INPUT',
        ]

        var doloop = true;
        for( ; doloop && ( program_counter < tokens.length ); program_counter++ ){
            var opcodes = tokens[program_counter];


            var line_num = opcodes.LINE_NUM;
            var code = opcodes.CMD;
            var value = opcodes.VAL;

            var callback = callback_maps[line_tokens.code];
            if( callback ){
                (callback)(line_tokens) ;
            }

            if( loop_breakers.indexOf( code ) > 0 ){
                doloop = false;
            }

        }

    }



}