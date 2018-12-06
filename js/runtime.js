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
            'OP_GT': this.exec_op_gt,
            'OP_LT': this.exec_op_lt,
            'OP_OR': this.exec_op_or,
            'OP_AND': this.exec_op_and,
            'OP_DIV': this.exec_op_div,
            'OP_MUL': this.exec_op_mul,
            'OP_ADD': this.exec_op_add,
            'OP_SUBT': this.exec_op_subt,
            'CALL_ABS': this.exec_call_abs,
            'CALL_ATN': this.exec_call_atn, 
            'CALL_COS': this.exec_call_cos,
            'CALL_EXP': this.exec_call_exp, 
            'CALL_INT': this.exec_call_int, 
            'CALL_LOG': this.exec_call_log, 
            'CALL_RND': this.exec_call_rnd, 
            'CALL_SIN': this.exec_call_sin, 
            'CALL_SQR': this.exec_call_sqr,
            'CALL_TAN': this.exec_call_tan, 
            'CALL_CLS': this.exec_call_cls,
            'END': this.exec_end,
        };

        var loop_breakers = [
            'INPUT_PROMPT', 'INPUT_NOPROMPT', 'END',
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
                throw "Runtime Error In Line " + that_opcode.LINE_NUM + ", could not assign " + var_preval.TYPE + " to string " ;
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
                throw "Runtime Error In Line " + that_opcode.LINE_NUM + ", could not assign " + var_preval.TYPE + " to string " ;
            }

            instance2.execute();

        });

    }

    exec_op_gt( instance, opcode ){

        var val1 = instance.var_stack_pop( instance );
        var val2 = instance.var_stack_pop( instance );

        if( val1.TYPE != 'NUM' || val2.TYPE != 'NUM' ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", both types need to be number" ;
        }

        var val3 = Number(val2.VAL) > Number(val1.VAL);

        instance.variable_stack.push({
            TYPE: 'BOOL',
            VAL: val3,
        });
    }

    exec_op_lt( instance, opcode ){

        var val1 = instance.var_stack_pop( instance );
        var val2 = instance.var_stack_pop( instance );

        if( val1.TYPE != 'NUM' || val2.TYPE != 'NUM' ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", both types need to be number" ;
        }

        var val3 = Number(val2.VAL) < Number(val1.VAL);

        instance.variable_stack.push({
            TYPE: 'BOOL',
            VAL: val3,
        });
    }

    exec_op_or( instance, opcode ){

        var val1 = instance.var_stack_pop( instance );
        var val2 = instance.var_stack_pop( instance );

        if( val1.TYPE != 'BOOL' || val2.TYPE != 'BOOL' ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", both types need to be boolean" ;
        }

        var val3 = val2.VAL || val1.VAL;

        instance.variable_stack.push({
            TYPE: 'BOOL',
            VAL: val3,
        });
    }

    exec_op_and( instance, opcode ){

        var val1 = instance.var_stack_pop( instance );
        var val2 = instance.var_stack_pop( instance );

        if( val1.TYPE != 'BOOL' || val2.TYPE != 'BOOL' ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", both types need to be boolean" ;
        }

        var val3 = val2.VAL && val1.VAL;

        instance.variable_stack.push({
            TYPE: 'BOOL',
            VAL: val3,
        });
    }

    exec_op_div( instance, opcode ){

        var val1 = instance.var_stack_pop( instance );
        var val2 = instance.var_stack_pop( instance );

        if( val1.TYPE != 'NUM' || val2.TYPE != 'NUM' ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", both types need to be number" ;
        }

        var val3 = Number(val2.VAL) / Number(val1.VAL);

        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: val3,
        });
    }

    exec_op_mul( instance, opcode ){

        var val1 = instance.var_stack_pop( instance );
        var val2 = instance.var_stack_pop( instance );

        if( val1.TYPE != 'NUM' || val2.TYPE != 'NUM' ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", both types need to be number" ;
        }

        var val3 =  Number(val2.VAL) * Number(val1.VAL);

        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: val3,
        });
    }

    exec_op_add( instance, opcode ){

        var val1 = instance.var_stack_pop( instance );
        var val2 = instance.var_stack_pop( instance );
        var val3 = null;

        if( val1.TYPE == 'NUM' && val2.TYPE == 'NUM' ){
            val3 =  Number(val2.VAL) + Number(val1.VAL);

        } else {
            val3 = val2.VAL + val1.VAL;
        }

        console.log( "val3 ", val3 );

        instance.variable_stack.push({
            TYPE: ( val1.TYPE == 'STR' || val2.TYPE == 'STR' ) ? 'STR' : 'NUM',
            VAL: val3,
        });
    }

    exec_op_subt( instance, opcode ){

        var val1 = instance.var_stack_pop( instance );
        var val2 = instance.var_stack_pop( instance );

        if( val1.TYPE != 'NUM' || val2.TYPE != 'NUM' ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", both types need to be number" ;
        }

        var val3 =  Number(val2.VAL) - Number(val1.VAL);

        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: val3,
        });
    }

    exec_call_abs( instance, opcode ){

        var val = instance.var_stack_pop( instance );

        if( val.TYPE != 'NUM'  ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", type need to be number" ;
        }

        var val3 =  abs(val.VAL);

        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: val3,
        });
    }

    exec_call_atn( instance, opcode ){

        var val = instance.var_stack_pop( instance );

        if( val.TYPE != 'NUM'  ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", type need to be number" ;
        }

        var val3 =  Math.atan(val.VAL);

        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: val3,
        });
    }

    exec_call_cos( instance, opcode ){

        var val = instance.var_stack_pop( instance );

        if( val.TYPE != 'NUM'  ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", type need to be number" ;
        }

        var val3 =  Math.cos(val.VAL);

        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: val3,
        });
    }

    exec_call_exp( instance, opcode ){

        var val = instance.var_stack_pop( instance );

        if( val.TYPE != 'NUM'  ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", type need to be number" ;
        }

        var val3 =  Math.exp(val.VAL);

        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: val3,
        });
    }

    exec_call_int( instance, opcode ){

        var val = instance.var_stack_pop( instance );

        if( val.TYPE != 'NUM'  ){
            throw "Runtime Error In Line " + opcode.line_num + ", type need to be number" ;
        }

        var val3 =  Number(val.VAL);

        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: val3,
        });
    }

    exec_call_log( instance, opcode ){

        var val = instance.var_stack_pop( instance );

        if( val.TYPE != 'NUM'  ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", type need to be number" ;
        }

        var val3 =  Math.log(val.VAL);

        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: val3,
        });
    }

    exec_call_rnd( instance, opcode ){

        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: Math.random(),
        });
    }

    exec_call_sin( instance, opcode ){

        var val = instance.var_stack_pop( instance );

        if( val.TYPE != 'NUM'  ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", type need to be number" ;
        }

        var val3 =  Math.sin(val.VAL);

        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: val3,
        });
    }

    exec_call_sqr( instance, opcode ){

        var val = instance.var_stack_pop( instance );

        if( val.TYPE != 'NUM'  ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", type need to be number" ;
        }

        var val3 =  Math.sqrt(val.VAL);

        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: val3,
        });
    }

    exec_call_tan( instance, opcode ){

        var val = instance.var_stack_pop( instance );

        if( val.TYPE != 'NUM'  ){
            throw "Runtime Error In Line " + opcode.LINE_NUM + ", type need to be number" ;
        }

        var val3 =  Math.tan(val.VAL);

        instance.variable_stack.push({
            TYPE: 'NUM',
            VAL: val3,
        });
    }

    exec_call_cls( instance, opcode ){
        instance.terminal.clear();
    }

    exec_end( instance, opcode ){
        console.log( "That's All Folks" );
    }
}