var expr_parser = new ExprParser();

class Parser {
    constructor(){
        expr_parser.parse = expr_parser.parse.bind(this);
    }

    parse( tokens ){

        var callback_maps = {
            'REM': this.parse_rem,
            'LET': this.parse_let,
            'ASSIGN': this.parse_assign,
            'PRINT': this.parse_print,
            'INPUT': this.parse_input,
            'GOTO': this.parse_goto,
            'DEFSUB': this.parse_defsub,
            'GOSUB': this.parse_gosub,
            'RETURN': this.parse_return,
            'IF': this.parse_if,
            'END': this.parse_end,
        };

        var opcodes = [];
        var lineno_map = {};
        var sub_map = {};

        for( var i = 0; i < tokens.length; i++ ){
            var line_tokens = tokens[i];

            var line_num = line_tokens.LINE_NUM;
            var callback = callback_maps[line_tokens.CMD];
            if( callback ){
                var callback_opcodes = (callback)(line_tokens) ;

                lineno_map[line_num] = opcodes.length;

                for( var idx = 0; idx < callback_opcodes.length; idx++ ){

                    var this_callback_opcode = callback_opcodes[idx] ;
                    this_callback_opcode.LINE_NUM = line_num;

                    if( this_callback_opcode.CODE == 'DEFSUB' ){
                        var subname = this_callback_opcode.VAL;
                        sub_map[subname] = line_num;
                    }

                    opcodes.push( this_callback_opcode );
                }
            }
        }

        //Remap GOTO and GOSUB
        for( var idx = 0; idx < opcodes.length; idx++ ){

            var this_opcode = opcodes[idx] ;
            if( this_opcode.CODE == 'GOSUB' ){
                var target_sub = this_opcode.VAL;
                if( sub_map[target_sub] ){
                    this_opcode.VAL = sub_map[target_sub];
                }
            } 
        }
        
        for( var idx = 0; idx < opcodes.length; idx++ ){

            var this_opcode = opcodes[idx] ;
            if( this_opcode.CODE == 'GOTO' || this_opcode.CODE == 'GOSUB' ){
                var target_linenum = this_opcode.VAL;
                if( lineno_map[target_linenum] ){
                    this_opcode.VAL = lineno_map[target_linenum];
                }
            }
        }

        return opcodes;
    }

    parse_rem( line_tokens ){
        return [{ CODE: 'REM', VAL: null }];
    }

    parse_let( line_tokens ){

        var opcodes_this = []

        var expr = line_tokens.EXPR;
        var varb = line_tokens.VAR;
        var type = line_tokens.TYPE

        var expr_opcodes = expr_parser.parse( expr );
        for( var idx = 0; idx < expr_opcodes.length; idx++ ){
            opcodes_this.push( expr_opcodes[idx] );
        }

        opcodes_this.push({
            CODE:'DEFVAR_' + type, VAL: varb,
        });

        return opcodes_this;
    }

    parse_assign( line_tokens ){

        var opcodes_this = []

        var expr = line_tokens.EXPR;
        var varb = line_tokens.VAR;
        var type = line_tokens.TYPE

        var expr_opcodes = expr_parser.parse( expr );
        for( var idx = 0; idx < expr_opcodes.length; idx++ ){
            opcodes_this.push( expr_opcodes[idx] );
        }

        opcodes_this.push({
            CODE:'SETVAR_' + type, VAL: varb,
        });

        return opcodes_this;
    }

    parse_print( line_tokens ){

        var opcodes_this = []

        var expr = line_tokens.EXPR;
        if( expr ){

            var expr_opcodes = expr_parser.parse( expr );
            for( var idx = 0; idx < expr_opcodes.length; idx++ ){
                opcodes_this.push( expr_opcodes[idx] );
            }

            opcodes_this.push({
                CODE:'PRINT', VAL: null,
            });
        }

        return opcodes_this;
    }

    parse_input( line_tokens ){
        
        var opcodes_this = [];

        var varb = line_tokens.VAR;
        var expr = line_tokens.EXPR;

        if( expr ){
            
            var expr_opcodes = expr_parser.parse( expr );
            for( var idx = 0; idx < expr_opcodes.length; idx++ ){
                opcodes_this.push( expr_opcodes[idx] );
            }

            opcodes_this.push({
                CODE:'INPUT_PROMPT', VAL: varb,
            });

        } else {

            opcodes_this.push({
                CODE:'INPUT_NOPROMPT', VAL: varb,
            });

        }

        return opcodes_this;
    }

    parse_goto( line_tokens ){
        var lineno = line_tokens.EXPR;
        return [{ CODE: 'GOTO', VAL: lineno }];
    }

    parse_defsub( line_tokens ){
        var subname = line_tokens.EXPR;
        return [{ CODE: 'DEFSUB', VAL: subname }];
    }

    parse_gosub( line_tokens ){
        var subname = line_tokens.EXPR;
        return [{ CODE: 'GOSUB', VAL: subname }];
    }

    parse_return( line_tokens ){
        return [{ CODE: 'RETURN', VAL: null }];
    }

    parse_if( line_tokens ){

        var if_expr = line_tokens.EXPR;
        var if_expr_opcodes = expr_parser.parse( if_expr );

        var subparser = new Parser();

        var then_cmd = line_tokens.THEN_EXPR;
        var then_opcodes = subparser.parse( then_cmd );

        var else_cmd = line_tokens.ELSE_EXPR;
        var else_opcodes = subparser.parse( else_cmd );

        var opcodes_this = [];

        for( var idx = 0; idx < if_expr_opcodes.length; idx++ ){
            opcodes_this.push( if_expr_opcodes[idx] );
        }
        opcodes_this.push({ CODE: 'IF', VAL: null });

        opcodes_this.push({ CODE: 'BEGIN-IF-THEN', VAL: null });
        for( var idx = 0; idx < then_opcodes.length; idx++ ){
            opcodes_this.push( then_opcodes[idx] );
        }
        opcodes_this.push({ CODE: 'END-IF-THEN', VAL: null });

        opcodes_this.push({ CODE: 'BEGIN-IF-ELSE', VAL: null });
        for( var idx = 0; idx < else_opcodes.length; idx++ ){
            opcodes_this.push( else_opcodes[idx] );
        }
        opcodes_this.push({ CODE: 'END-IF-ELSE', VAL: null });
        opcodes_this.push({ CODE: 'END-IF', VAL: null });

        return opcodes_this;
    }

    parse_end( line_tokens ){
        return [{ CODE: 'END', VAL: null }];
    }

}