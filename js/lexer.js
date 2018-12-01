class Lexer {
    constructor( text ){
        this.text = text;
    }

    parse(){

        var tokens = [];
        var codes_lines = [];
        var codes_lines_raw = this.text.split( '\n' );

        for( var i = 0; i < codes_lines_raw.length; i++ ){
            if( codes_lines_raw[i] && codes_lines_raw[i].trim().length > 0 ){
                codes_lines.push( codes_lines_raw[i].trim() );
            }
        }

        codes_lines.sort();

        var callback_maps = {
            'REM': this.parse_rem,
            'LET': this.parse_let,
            'PRINT': this.parse_print,
            'INPUT': this.parse_input,
            'IF': this.parse_if,
            'END': this.parse_end,
        }

        for( var j = 0; j < codes_lines.length; j++ ){

            var line_tokens = codes_lines[j].split(' ');

            var cmd = line_tokens[1];
            var callback = callback_maps[cmd];

            if( callback ){
                var defination = (line_tokens) => callback;
                tokens.push( defination ) ;
            }

        }

        return tokens;
    }

    parse_rem( line_tokens ){
        return {
            CMD: 'REM',
        };
    }

    parse_let( line_tokens ){

        var expr = [];
        for( var token_count = 4; token_count < line_tokens.length; token_count++ ){
            expr.push( line_tokens[token_count] );
        }

        return {
            CMD: 'LET',
            VAR: line_tokens[2],
            TYPE: line_tokens[2].endsWith('$') ? 'STRING' : 'NUM',
            EXPR: expr,
        };
    }

    parse_print( line_tokens ){

        var expr = [];
        for( var token_count = 2; token_count < line_tokens.length; token_count++ ){
            expr.push( line_tokens[token_count] );
        }

        return {
            CMD: 'PRINT',
            EXPR: expr,
        };
    }

    parse_input( line_tokens ){

        var expr = [];
        if( this_line.indexOf(',') > 0 ){
            for( var token_count = 2; token_count < ( line_tokens.length - 1 ); token_count++ ){
                expr.push( line_tokens[token_count] );
            }
        }

        return {
            CMD: 'INPUT',
            VAR: line_tokens[ line_tokens.length - 1 ],
            TYPE: line_tokens[ line_tokens.length - 1 ].endsWith('$') ? 'STRING' : 'NUM',
            EXPR: expr,
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
            EXPR: if_expr,
            THEN_EXPR: then_expr,
            ELSE_EXPR: else_expr,
        };
    }

    parse_end( line_tokens ){
        return {
            CMD: 'END',
        }
    }
}