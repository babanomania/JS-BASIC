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
            'END': this.parse_end,
        };

        var opcodes = [];
        for( var i = 0; i < tokens.length; i++ ){
            var line_tokens = tokens[i];

            var callback = callback_maps[line_tokens.CMD];
            if( callback ){
                var callback_opcodes = (callback)(line_tokens) ;

                for( var idx = 0; idx < callback_opcodes.length; idx++ ){
                    opcodes.push( callback_opcodes[idx] );
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

        opcodes_this.push({
            CODE:'PRINT_NEWLINE', VAL: null,
        });

        return opcodes_this;
    }

    parse_input( line_tokens ){
        
        var opcodes_this = []

        var varb = line_tokens.VAR;
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

        opcodes_this.push({
            CODE:'INPUT', VAL: varb,
        });

        return opcodes_this;
    }

    parse_end( line_tokens ){
        return [{ CODE: 'END', VAL: null }];
    }

}