class ExprLexer {

    test(){
        return this.parse([
            '(',
            '(',
            'A',
            '+',
            'B',
            ')',
            '+',
            'C',
            ')',
            '+',
            'D',
        ]);
    }

    parse( tokens ){

        var operands = [
            'OR',
            'AND',
            '/',
            '*',
            '+',
            '-',
        ];

        var OPCODES = {
            'OR': 'OP_OR',
            'AND': 'OP_AND',
            '/': 'OP_DIV',
            '*': 'OP_MUL',
            '+': 'OP_ADD',
            '-': 'OP_SUBT',
        };

        var expr_tokens = [];
        if( tokens.length == 1 ){

            var type = null;
            if( tokens[0] ){
            
                if( tokens[0].indexOf('"') >= 0 ){
                    type = 'STRING';

                } else if( isNaN( tokens[0] ) ){
                    type = 'VAR';

                } else {
                    type = 'NUM';
                }

            }

            return {
                TYPE: type,
                VAL: tokens[0],
            };

        } else if( ( tokens[0] == '(' ) && ( tokens[ tokens.length - 1 ] == ')' ) ){
            return this.parse( tokens.splice( 1, tokens.length - 2 ) );

        } else {

            var operand_found = false;

            var copied_tokens = [];
            var open_brackets = 0;

            var contains_brackets = ( tokens.indexOf('(') > 0 );
            for( var ind = 0; ind < tokens.length; ind++ ){

                if( tokens[ind] == '(' ){
                    open_brackets = open_brackets + 1;

                } 

                if( open_brackets > 0 ){
                    copied_tokens[ind] = 'DUMMY';

                } else {
                    copied_tokens[ind] = tokens[ind];
                }

                if( tokens[ind] == ')' ){
                    open_brackets = open_brackets - 1;
                    
                } 

            }

            for( var op = 0; op < operands.length; op++ ){

                var each_operand = operands[op];
                if( copied_tokens.indexOf( each_operand ) > 0 ){

                    operand_found = true;
                    var operand_index = copied_tokens.indexOf( each_operand );
                    var lvalue = tokens.slice( 0, operand_index );
                    var rvalue = tokens.slice( operand_index + 1, tokens.length );

                    return {
                        CMD: 'EXPR',
                        FUNC: OPCODES[each_operand],
                        LVALUE: this.parse(lvalue),
                        RVALUE: this.parse(rvalue),
                    };

                }
            }

            if( !operand_found ) {

                var pushed_values = '';
                for( var id = 0; id < tokens.length; id++ ){
                    pushed_values = pushed_values + ' ' + tokens[id];
                }

                return this.parse( [ pushed_values.trim() ] );

            }
        }
    }
}