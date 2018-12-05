var expr_lexer = new ExprLexer();

class Lexer {
    constructor(){
        expr_lexer.parse = expr_lexer.parse.bind(this);
    }

    parse( codes_lines ){
        
        var callback_maps = {
            'REM': this.parse_rem,
            'LET': this.parse_let,
            'PRINT': this.parse_print,
            'INPUT': this.parse_input,
            'IF': this.parse_if,
            'FOR': this.parse_for,
            'NEXT': this.parse_next,
            'WHILE': this.parse_while,
            'WEND': this.parse_wend,
            'DO': this.parse_do,
            'LOOP': this.parse_loop,
            'GOTO': this.parse_goto,
            'GOSUB': this.parse_gosub,
            'RETURN': this.parse_return,
            'SUB': this.parse_gosub,
            'ON': this.parse_on,
            'END': this.parse_end,
        }

        var inbuild_functions =[
            'ABS', 'ATN', 'COS', 'EXP', 'INT', 'LOG', 'RND', 'SIN', 'SQR', 'TAN', 'CLS'
        ]

        var tokens = [];
        for( var j = 0; j < codes_lines.length; j++ ){

            var line_tokens = codes_lines[j].split(' ');

            var line_num = line_tokens[0];
            var cmd = line_tokens[1];
            var callback = callback_maps[cmd];

            if( !callback ){
            
                if( cmd.endsWith(':') ){
                    callback = callback_maps['SUB'];

                } else if ( line_tokens[2] = '=' ) {
                    callback = this.parse_assign;

                } else if ( inbuild_functions.indexOf( cmd ) > 0 ){
                    callback = this.parse_function_call;

                }
            }

            var callback_op = (callback)(line_tokens);
            callback_op.LINE_NUM = line_num;

            tokens.push( callback_op ) ;

        }

        return tokens;
    }

    cleanup( text ){

        var codes_lines = [];
        var codes_lines_raw = text.split( '\n' );

        for( var i = 0; i < codes_lines_raw.length; i++ ){
            if( codes_lines_raw[i] && codes_lines_raw[i].trim().length > 0 ){
                
                var line = codes_lines_raw[i];
                line = line.toUpperCase();
                line = line.replace( /\=/g, ' = ' );
                line = line.replace( /\(/g, ' ( ' );
                line = line.replace( /\)/g, ' ) ' );
                line = line.replace( /\+/g, ' + ' );
                line = line.replace( /\-/g, ' - ' );
                line = line.replace( /\*/g, ' * ' );
                line = line.replace( /\\/g, ' \\ ' );
                line = line.replace( /\</g, ' < ' );
                line = line.replace( /\>/g, ' > ' );
                line = line.replace(/\s\s+/g, ' ');
                line = line.trim();
                console.log( line )

                codes_lines.push( line );
            }
        }

        codes_lines.sort();
        return codes_lines;
    }

    parse_rem( line_tokens ){
        return {
            CMD: 'REM',
        };
    }

    parse_let( line_tokens ){

        var exprs = [];
        for( var token_count = 4; token_count < line_tokens.length; token_count++ ){
            exprs.push( line_tokens[token_count] );
        }

        return {
            CMD: 'LET',
            VAR: line_tokens[2],
            TYPE: line_tokens[2].endsWith('$') ? 'STR' : 'NUM',
            EXPR: expr_lexer.parse(exprs),
        };;
    }

    parse_print( line_tokens ){

        var expr = [];
        for( var token_count = 2; token_count < line_tokens.length; token_count++ ){
            expr.push( line_tokens[token_count] );
        }

        return {
            CMD: 'PRINT',
            EXPR: expr_lexer.parse(expr),
        };
    }

    parse_input( line_tokens ){

        var expr = [];
        var has_prompt = false;

        var idx_prompt_start = -1;
        var idx_prompt_end = -1;

        for( var token_count = 1; token_count < line_tokens.length; token_count++ ){

            if( line_tokens[token_count].startsWith( '"' ) && !has_prompt ){
                has_prompt = true;
                idx_prompt_start = token_count

            } else if( line_tokens[token_count].endsWith( '"' ) && has_prompt ){
                idx_prompt_end = token_count
            }
        }
        
        if( idx_prompt_start != -1 & idx_prompt_end != -1 ){
            for( var idx = idx_prompt_start; idx <= idx_prompt_end; idx++ ){
                expr.push( line_tokens[idx] );
            }
        }

        return {
            CMD: 'INPUT',
            VAR: line_tokens[ line_tokens.length - 1 ],
            EXPR: expr.length > 0 ? expr_lexer.parse(expr) : null,
        };
    }

    parse_if( line_tokens ){

        var if_expr = [];
        var then_expr = [];
        var else_expr = [];

        var if_index = -1;
        var then_index = -1;
        var else_index = -1;

        for( var index = 0 ; index < line_tokens.length; index++ ){
            if( line_tokens[index] == 'IF' ){
                if_index = index;

            } else if( line_tokens[index] == 'THEN' ){
                then_index = index;

            } else if( line_tokens[index] == 'ELSE' ){
                else_index = index;
            }
        }

        for( var index = ( if_index + 1 ) ; index < then_index; index ++ ){
            if_expr.push( line_tokens[index] );
        }

        for( var index = ( then_index + 1 ) ; index < else_index; index ++ ){
            then_expr.push( line_tokens[index] );
        }

        if( else_index > 0 ){
            for( var index = ( else_index + 1 ) ; index < line_tokens.length; index ++ ){
                else_expr.push( line_tokens[index] );
            }
        }

        return {
            CMD: 'IF',
            EXPR: expr_lexer.parse(if_expr),
            THEN_EXPR: expr_lexer.parse(then_expr),
            ELSE_EXPR: expr_lexer.parse(else_expr),
        };
    }

    parse_for( line_tokens ){

        var for_expr = [];
        var to_expr = [];
        var step_expr = [];

        var for_index = -1;
        var to_index = -1;
        var step_index = -1;

        for( var index = 0 ; index < line_tokens.length; index++ ){
            if( line_tokens[index] == 'FOR' ){
                for_index = index;

            } else if( line_tokens[index] == 'TO' ){
                to_index = index;

            } else if( line_tokens[index] == 'NEXT' ){
                step_index = index;
            }
        }

        for( var index = ( for_expr + 1 ) ; index < to_index; index ++ ){
            for_expr.push( line_tokens[index] );
        }

        for( var index = ( to_index + 1 ) ; index < step_index; index ++ ){
            to_expr.push( line_tokens[index] );
        }

        if( step_expr > 0 ){
            for( var index = ( step_index + 1 ) ; index < line_tokens.length; index ++ ){
                step_expr.push( line_tokens[index] );
            }
        }

        return {
            CMD: 'FOR',
            EXPR: for_expr,
            TO_EXPR: expr_lexer.parse(then_expr),
            STEP_EXPR: expr_lexer.parse(step_expr),
        };
    }

    parse_next( line_tokens ){

        var expr = [];
        for( var token_count = 2; token_count < line_tokens.length; token_count++ ){
            expr.push( line_tokens[token_count].replace( ',', '' ) );
        }

        return {
            CMD: 'NEXT',
            EXPR: expr_lexer.parse(expr),
        };
    }


    parse_while( line_tokens ){

        var expr = [];
        for( var token_count = 2; token_count < line_tokens.length; token_count++ ){
            expr.push( line_tokens[token_count] );
        }

        return {
            CMD: 'WHILE',
            EXPR: expr_lexer.parse(expr),
        };
    }

    parse_wend( line_tokens ){
        return {
            CMD: 'WEND',
        }
    }

    parse_do( line_tokens ){
        return {
            CMD: 'DO',
        };
    }

    parse_end( line_tokens ){
        return {
            CMD: 'END',
        }
    }

    parse_loop( line_tokens ){

        var expr = [];
        for( var token_count = 3; token_count < line_tokens.length; token_count++ ){
            expr.push( line_tokens[token_count] );
        }

        return {
            CMD: 'LOOP',
            EXPR: expr,
        }
    }

    parse_goto( line_tokens ){

        var expr = [];
        for( var token_count = 2; token_count < line_tokens.length; token_count++ ){
            expr.push( line_tokens[token_count].replace( ',', '' ) );
        }

        return {
            CMD: 'GOTO',
            EXPR: expr,
        }
    }

    parse_gosub( line_tokens ){

        var expr = [];
        for( var token_count = 2; token_count < line_tokens.length; token_count++ ){
            expr.push( line_tokens[token_count].replace( ',', '' ) );
        }

        return {
            CMD: 'GOSUB',
            EXPR: expr,
        }
    }

    parse_return( line_tokens ){
        return {
            CMD: 'RETURN',
            EXPR: line_tokens
        }
    }

    parse_sub( line_tokens ){
        return {
            CMD: 'SUB',
            SUBNAME: line_tokens[0].substring( 0, (line_tokens[0].length - 1) ),
            EXPR: line_tokens
        }
    }

    parse_on( line_tokens ){

        var is_goto = false;
        var is_gosub = false;

        for( var index = 0 ; index < line_tokens.length; index++ ){
            if( line_tokens[index] == 'GOTO' ){
                is_goto = true;

            } else if( line_tokens[index] == 'GOSUB' ){
                is_gosub = true;

            }
        }

        return is_goto ? parse_on_goto( line_tokens ) : parse_on_gosub( line_tokens );
    }

    parse_on_goto( line_tokens ){

        var goto_index = -1;
        var expr = [];
        var goto_expr = [];

        for( var index = 0 ; index < line_tokens.length; index++ ){
            if( line_tokens[index] == 'GOTO' ){
                goto_index = index;

            }
        }

        for( var index = 1 ; index < goto_index; index++ ){            
            expr.push( line_tokens[index] );

        }

        for( var index = goto_index ; index < line_tokens.length; index++ ){            
            goto_expr.push( line_tokens[index].replace( ',', '' ) );

        }

        return {
            CMD: 'ON-GOTO',
            EXPR: expr_lexer.parse(expr),
            GOTO_EXPR: goto_expr,
        }
    }

    parse_on_gosub( line_tokens ){
        
        var gosub_index = -1;
        var expr = [];
        var gosub_expr = [];

        for( var index = 0 ; index < line_tokens.length; index++ ){
            if( line_tokens[index] == 'GOSUB' ){
                gosub_index = index;

            }
        }

        for( var index = 1 ; index < goto_index; index++ ){            
            expr.push( line_tokens[index] );

        }

        for( var index = goto_index ; index < line_tokens.length; index++ ){            
            gosub_expr.push( line_tokens[index].replace( ',', '' ) );

        }

        return {
            CMD: 'ON-GOSUB',
            EXPR: expr_lexer.parse(expr),
            GOTO_EXPR: goto_expr,
        }
    }

    parse_assign( line_tokens ){

        var expr = [];
        for( var token_count = 3; token_count < line_tokens.length; token_count++ ){
            expr.push( line_tokens[token_count] );
        }

        return {
            CMD: 'ASSIGN',
            VAR: line_tokens[1],
            TYPE: line_tokens[1].endsWith('$') ? 'STR' : 'NUM',
            EXPR: expr_lexer.parse(expr),
        };
    }

    parse_function_call( line_tokens ){

        var expr = [];
        for( var token_count = 3; token_count < ( line_tokens.length - 1 ); token_count++ ){
            expr.push( line_tokens[token_count] );
        }

        return {
            CMD: 'CALL',
            FUNC_NAME: line_tokens[1],
            EXPR: expr_lexer.parse(expr),
        };
    }

}