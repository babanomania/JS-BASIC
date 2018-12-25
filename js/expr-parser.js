class ExprParser {

    constructor(){
        this.parse = this.parse.bind(this);
    }

    test( test_tokens ){
        return this.parse( test_tokens );
    }

    parse( tokens ){

        var expr_opcodes = [];
        
        var OPCODES = [
            'OP_GT',
            'OP_LT',
            'OP_GTE',
            'OP_LTE',
            'OP_OR',
            'OP_AND',
            'OP_DIV',
            'OP_MUL',
            'OP_ADD',
            'OP_SUBT',
        ];

        var inbuild_functions =[
            'ABS', 'ATN', 'COS', 'EXP', 'INT', 'LOG', 'SIN', 'SQR', 'TAN'
        ];

        var inbuild_functions_single =[
            'RND', 'CLS'
        ];

        var inbuild_functions_opcode ={
            'ABS' : 'CALL_ABS', 
            'ATN' : 'CALL_ATN',
            'COS' : 'CALL_COS',
            'EXP' : 'CALL_EXP',
            'INT' : 'CALL_INT',
            'LOG' : 'CALL_LOG',
            'RND' : 'CALL_RND',
            'SIN' : 'CALL_SIN',
            'SQR' : 'CALL_SQR',
            'TAN' : 'CALL_TAN',
            'CLS' : 'CALL_CLS',
        };

        if( !tokens ){
            return;

        } else if( tokens.TYPE == 'NUM' & tokens.ECMD == 'SET' ){
            return [{ CODE: 'PUSH_NUM', VAL: tokens.VAL }];

        } else if( tokens.TYPE == 'STR' & tokens.ECMD == 'SET' ){
            return [{ CODE: 'PUSH_STR', VAL: tokens.VAL }];

        } else if( tokens.TYPE == 'VAL' & tokens.ECMD == 'SET' ){
            return [{ CODE: 'PUSH_VAL', VAL: tokens.VAL }];

        } else if( tokens.TYPE == 'VAR'  & tokens.ECMD == 'SET' ){
            return [{ CODE: 'PUSH_VAR', VAL: tokens.VAL }];

        } else if( OPCODES.indexOf( tokens.OP_NAME ) >= 0 ){

            var lval_codes = this.parse( tokens.LVALUE );
            var rval_codes = this.parse( tokens.RVALUE );

            var return_opcode = [];

            for( var lidx = 0; lidx < lval_codes.length; lidx++ ){
                return_opcode.push( lval_codes[lidx] );
            }

            if( rval_codes ){
                for( var ridx = 0; ridx < rval_codes.length; ridx++ ){
                    return_opcode.push( rval_codes[ridx] );
                }
            }

            return_opcode.push({
                CODE: tokens.OP_NAME, 
            });

            return return_opcode;

        } else if( inbuild_functions.indexOf( tokens.FUNC_NAME ) >= 0 ){

            var expr_codes = this.parse( tokens.EXPR );
            var return_opcode = [];
            for( var idx = 0; idx < expr_codes.length; idx++ ){
                return_opcode.push( expr_codes[idx] );
            }

            return_opcode.push({
                CODE: inbuild_functions_opcode[ tokens.FUNC_NAME ], 
            });

            return return_opcode;

        } else if( inbuild_functions_single.indexOf( tokens.FUNC_NAME ) >= 0 ){

            var return_opcode = [];
            return_opcode.push({
                CODE: inbuild_functions_opcode[ tokens.FUNC_NAME ], 
            });

            return return_opcode;

        } else {
            console.log( "nothing found for ", tokens );
            console.log( "inbuild_functions_single.indexOf( tokens.FUNC_NAME ) = ", inbuild_functions_single.indexOf( tokens.FUNC_NAME ) );
        }


        return expr_opcodes;
    }
}