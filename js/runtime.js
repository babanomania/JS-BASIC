class Runtime{

    constructor( terminal ){
        this.variable_stack = [];
        this.variable_defs = {};
        this.program_counter = 0;
        this.terminal = terminal;
    }

    upload_opcodes( op_codes ){
        this.clear();
        this.op_codes = op_codes;
    }

    clear(){
        this.variable_stack = [];
        this.variable_defs = {};
        this.program_counter = 0;
        this.terminal.clear();
    }

    execute(){
        
        var callback_maps = {
            'PUSH_NUM': this.exec_push_num,
            'PUSH_STR': this.exec_push_str,
            'PUSH_VAR': this.exec_push_var,
            'DEFVAR_NUM': this.exec_defvar_num,
            'DEFVAR_STR': this.exec_defvar_str,
            'SETVAR_NUM': this.exec_setvar_num,
            'SETVAR_STR': this.exec_setvar_str,
            'PRINT': this.exec_print,
            'INPUT_PROMPT': this.exec_input_prompt,
            'INPUT_NOPROMPT': this.exec_input_noprompt,
            'OP_GT': null,
            'OP_LT': null,
            'OP_OR': null,
            'OP_AND': null,
            'OP_DIV': null,
            'OP_MUL': null,
            'OP_ADD': this.exec_op_add,
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
            'INPUT_PROMPT', 'INPUT_NOPROMPT',
        ]

        var doloop = true;
        for( ; doloop && ( this.program_counter < this.op_codes.length ); this.program_counter++ ){

            var opcodes = this.op_codes[this.program_counter];
            console.log( opcodes, this );

            var line_num = opcodes.LINE_NUM;
            var code = opcodes.CODE;
            var value = opcodes.VAL;

            var callback = callback_maps[code];
            if( callback ){
                (callback)(this, opcodes) ;
            }

            if( loop_breakers.indexOf( code ) >= 0 ){
                doloop = false;
            }
            
        }

    }

    var_stack_pop( instance ){
        var last_ele = instance.variable_stack[ instance.variable_stack.length - 1];
        instance.variable_stack.pop();
        return last_ele;
    }

    exec_push_num( instance, opcode ){
        var value = opcode.VAL;
        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: value
        });
    }

    exec_push_str( instance, opcode ){
        var value = opcode.VAL;
        instance.variable_stack.push({
            TYPE: 'STR',
            VAL: value
        });
    }

    exec_push_var( instance, opcode ){
        var value = instance.variable_defs[opcode.VAL];
        instance.variable_stack.push({
            TYPE: value.TYPE,
            VAL: value.VAL,
        });
    }

    exec_defvar_num( instance, opcode ){
        var varname = opcode.VAL;
        var value = instance.var_stack_pop( instance );

        if( value.TYPE == 'NUM' ){
            instance.variable_defs[varname] = value;

        } else {
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", could not assign " + value.TYPE + " to number " ;
        }
    }

    exec_defvar_str( instance, opcode ){
        var varname = opcode.VAL;
        var value = instance.var_stack_pop( instance );

        if( value.TYPE == 'STR' ){
            instance.variable_defs[varname] = value;
            
        } else {
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", could not assign " + value.TYPE + " to string " ;
        }
    }

    exec_setvar_num( instance, opcode ){

        var varname = opcode.VAL;
        var value = instance.var_stack_pop( instance );

        if( value.TYPE == 'NUM' ){
            instance.variable_defs[varname] = value;

        } else {
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", could not assign " + value.TYPE + " to number " ;
        }
    }

    exec_setvar_str( instance, opcode ){
        
        var varname = opcode.VAL;
        var value = instance.var_stack_pop( instance );

        if( value.TYPE == 'STR' ){
            instance.variable_defs[varname] = value;

        } else {
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", could not assign " + value.TYPE + " to string " ;
        }
    }

    exec_print( instance, opcode ){

        var value = instance.var_stack_pop( instance );
        instance.terminal.print( value.VAL );
    }

    exec_input_prompt( instance, opcode ){
        
        var varname = opcode.VAL;
        var prompt = instance.var_stack_pop( instance );

        terminal.input( prompt.VAL, varname, opcode.LINE_NUM, instance, ( name, value, line_num, instance2 ) => {
            
            var that_opcode = instance2.op_codes[ instance2.program_counter - 1 ];

            var var_preval = instance2.variable_defs[varname];
            var_preval.VAL = value;

            if( ( var_preval.TYPE == 'NUM' ) && ( isNaN(value) ) ){
                throw "Runtime Error In Line " + line_num + ", could not assign " + var_preval.TYPE + " to string " ;
            }

            instance2.execute();

        });
    }

    exec_input_noprompt( instance, opcode ){

        var varname = opcode.VAL;

        terminal.input( null, varname, opcode.LINE_NUM, instance, ( name, value, line_num, instance2  ) => {
            
            var that_opcode = instance2.op_codes[ instance2.program_counter - 1 ];

            var var_preval = instance2.variable_defs[varname];
            var_preval.VAL = value;

            if( ( var_preval.TYPE == 'NUM' ) && ( isNaN(value) ) ){
                throw "Runtime Error In Line " + line_num + ", could not assign " + var_preval.TYPE + " to string " ;
            }

            instance2.execute();

        });

    }

    exec_op_add( instance, opcode ){

        var val1 = instance.var_stack_pop( instance );
        var val2 = instance.var_stack_pop( instance );
        var val3 = val2.VAL + val1.VAL;

        console.log( "exec_op_add, val1 ", val1 );
        console.log( "exec_op_add, val2 ", val2 );
        console.log( "exec_op_add, val3 ", val3 );

        instance.variable_stack.push({
            TYPE: ( val1.TYPE == 'STR' || val2.TYPE == 'STR' ) ? 'STR' : 'NUM',
            VAL: val3,
        });
    }
}